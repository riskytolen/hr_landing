export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ALLOWED_DOC_TYPES,
  DOC_CONFIGS,
  MAX_DOC_SIZE_BYTES,
  MAX_DOC_SIZE_MB,
  isDocRequired,
  validatePayload,
  type DocType,
  type LamarPayload,
} from "@/lib/validation";

const BUCKET = "recruitment-docs";

type IncomingFile = Blob & { name?: string; type?: string; size: number };

function getFormFile(fd: FormData, type: DocType): IncomingFile | null {
  const value = fd.get(type);
  if (!value || typeof value === "string" || !("size" in value) || value.size === 0) return null;
  return value as IncomingFile;
}

function fileExt(mimeType: string): "png" | "jpg" {
  return mimeType === "image/png" ? "png" : "jpg";
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    // ─── Rate limit ───
    const ip = getClientIp(req);
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan.", retryAfterSec: rl.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    // ─── Parse multipart ───
    const fd = await req.formData();
    const payloadRaw = fd.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }

    let payload: Partial<LamarPayload>;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    }

    // ─── Validasi field ───
    const fieldErrors = validatePayload(payload);
    if (fieldErrors.length > 0) {
      return NextResponse.json({ error: "Validasi gagal", fieldErrors }, { status: 400 });
    }

    // ─── Validasi dokumen ───
    const docFiles: Partial<Record<DocType, IncomingFile>> = {};
    const docErrors: Array<{ field: string; message: string }> = [];

    for (const doc of DOC_CONFIGS) {
      const file = getFormFile(fd, doc.type);
      const required = isDocRequired(doc.type, payload.posisi_dilamar);

      if (!file) {
        if (required) docErrors.push({ field: `doc_${doc.type}`, message: `${doc.label} wajib dilampirkan.` });
        continue;
      }

      const type = file.type ?? "";
      if (!ALLOWED_DOC_TYPES.includes(type)) {
        docErrors.push({ field: `doc_${doc.type}`, message: `${doc.label} harus berupa JPG/PNG.` });
        continue;
      }

      if (file.size > MAX_DOC_SIZE_BYTES) {
        docErrors.push({ field: `doc_${doc.type}`, message: `${doc.label} maksimal ${MAX_DOC_SIZE_MB} MB.` });
        continue;
      }

      docFiles[doc.type] = file;
    }

    if (docErrors.length > 0) {
      return NextResponse.json({ error: "Validasi dokumen gagal", fieldErrors: docErrors }, { status: 400 });
    }

    // ─── Insert recruitment ───
    const admin = createAdminClient();
    const insertPayload = {
      nama: payload.nama!.trim(),
      no_hp: payload.no_hp!.trim(),
      email: payload.email?.trim() || null,
      posisi_dilamar: payload.posisi_dilamar!,
      pendidikan_terakhir: payload.pendidikan_terakhir!,
      pengalaman_kerja: payload.pekerjaan_terakhir?.trim() || null,
      alamat: payload.alamat!.trim(),
      status: "Lamaran Masuk" as const,
      catatan: null,
      tanggal_lahir: payload.tanggal_lahir!,
      lama_kerja_terakhir: payload.lama_kerja_terakhir?.trim() || null,
      daerah_kerja_terakhir: payload.daerah_kerja_terakhir?.trim() || null,
      status_pernikahan_pelamar: payload.status_pernikahan_pelamar || null,
      bisa_nyupir: payload.bisa_nyupir,
      bersedia_shift: payload.bersedia_shift,
      bersedia_jabodetabek: payload.bersedia_jabodetabek,
      sumber_lamaran: "landing",
    };

    const { data: inserted, error: insertErr } = await admin
      .from("recruitments")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("[lamar] insert error:", insertErr);
      return NextResponse.json(
        { error: insertErr?.message || "Gagal menyimpan lamaran." },
        { status: 500 },
      );
    }

    const recruitmentId = inserted.id as number;

    // ─── Upload dokumen ───
    const uploadedPaths: string[] = [];
    const urlUpdates: Record<string, string> = {};

    for (const doc of DOC_CONFIGS) {
      const file = docFiles[doc.type];
      if (!file) continue;

      const ext = fileExt(file.type ?? "");
      const path = `${doc.folder}/${recruitmentId}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (upErr) {
        if (uploadedPaths.length > 0) await admin.storage.from(BUCKET).remove(uploadedPaths);
        await admin.from("recruitments").delete().eq("id", recruitmentId);
        return NextResponse.json(
          { error: `Gagal menyimpan ${doc.label} ke Storage Supabase: ${upErr.message}` },
          { status: 500 },
        );
      }

      uploadedPaths.push(path);
      const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
      urlUpdates[doc.urlColumn] = pub.publicUrl;
    }

    if (Object.keys(urlUpdates).length > 0) {
      const { error: updateErr } = await admin
        .from("recruitments")
        .update(urlUpdates)
        .eq("id", recruitmentId);

      if (updateErr) {
        if (uploadedPaths.length > 0) await admin.storage.from(BUCKET).remove(uploadedPaths);
        await admin.from("recruitments").delete().eq("id", recruitmentId);
        return NextResponse.json(
          { error: "Dokumen berhasil diupload, tapi gagal menyimpan URL dokumen: " + updateErr.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      id: recruitmentId,
      uploaded: Object.fromEntries(DOC_CONFIGS.map((doc) => [doc.type, Boolean(urlUpdates[doc.urlColumn])])),
    });
  } catch (err) {
    console.error("[lamar] unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Silakan coba lagi." },
      { status: 500 },
    );
  }
}



