export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ALLOWED_CV_TYPES,
  MAX_CV_SIZE_BYTES,
  validatePayload,
  type LamarPayload,
} from "@/lib/validation";

const BUCKET = "recruitment-docs";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    //  Validasi CV (WAJIB) 
    const cvFile = fd.get("cv");
    let cvBlob: Blob | null = null;
    let cvName: string | null = null;
    let cvType: string | null = null;
    
    if (!cvFile || typeof cvFile === "string" || !("size" in cvFile) || cvFile.size === 0) {
      return NextResponse.json({ error: "File CV/KTP wajib dilampirkan." }, { status: 400 });
    }

    const f = cvFile as Blob & { name?: string; type?: string };
    if (f.size > MAX_CV_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran file melebihi 5 MB." }, { status: 400 });
    }
    
    const fileType = f.type ?? "";
    if (!ALLOWED_CV_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Tipe file tidak diperbolehkan (hanya PDF/JPG/PNG)." },
        { status: 400 },
      );
    }
    
    cvBlob = f;
    cvName = f.name ?? "cv";
    cvType = fileType;

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
      sim: payload.sim || null,
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

    // ─── Upload CV (kalau ada) ───
    let cvUrl: string | null = null;
    if (cvBlob && cvType) {
      const ext = cvType === "application/pdf" ? "pdf"
        : cvType === "image/png" ? "png"
        : "jpg";
      // Path: lamaran/{id}_{timestamp}.{ext}
      const path = `lamaran/${recruitmentId}_${Date.now()}.${ext}`;
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(path, cvBlob, { contentType: cvType, upsert: false });

      if (upErr) {
        console.warn("[lamar] CV upload failed:", upErr.message);
        // Lamaran sudah masuk, CV failed → tetap success tapi tanpa cv_url
      } else {
        const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
        cvUrl = pub.publicUrl;
        await admin
          .from("recruitments")
          .update({ cv_url: cvUrl })
          .eq("id", recruitmentId);
      }
    }

    return NextResponse.json({
      success: true,
      id: recruitmentId,
      cv_uploaded: cvUrl !== null,
    });
  } catch (err) {
    console.error("[lamar] unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Silakan coba lagi." },
      { status: 500 },
    );
  }
}


