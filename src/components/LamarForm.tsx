"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import {
  User,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Heart,
  Car,
  IdCard,
  Camera,
  CreditCard,
  Clock,
  MapPinned,
  GraduationCap,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import {
  ALLOWED_DOC_TYPES,
  DOC_CONFIGS,
  MAX_DOC_SIZE_BYTES,
  MAX_DOC_SIZE_MB,
  PENDIDIKAN_OPTIONS,
  POSISI_OPTIONS,
  calculateAge,
  isDocRequired,
  isValidPhone,
  type DocType,
  type LamarPayload,
} from "@/lib/validation";

interface FormState {
  nama: string;
  tanggal_lahir: string;
  alamat: string;
  email: string;
  no_hp: string;
  pendidikan_terakhir: string;
  posisi_dilamar: string;
  pekerjaan_terakhir: string;
  lama_kerja_terakhir: string;
  daerah_kerja_terakhir: string;
  status_pernikahan_pelamar: "Berkeluarga" | "Belum Berkeluarga" | "";
  bisa_nyupir: boolean | null;
  bersedia_shift: boolean | null;
  bersedia_jabodetabek: boolean | null;
  // honeypot — harus tetap kosong
  hp_field: string;
}

const INITIAL_STATE: FormState = {
  nama: "",
  tanggal_lahir: "",
  alamat: "",
  email: "",
  no_hp: "",
  pendidikan_terakhir: "",
  posisi_dilamar: "",
  pekerjaan_terakhir: "",
  lama_kerja_terakhir: "",
  daerah_kerja_terakhir: "",
  status_pernikahan_pelamar: "",
  bisa_nyupir: null,
  bersedia_shift: null,
  bersedia_jabodetabek: null,
  hp_field: "",
};

const EMPTY_DOC_FILES: Record<DocType, File | null> = {
  cv: null,
  ktp: null,
  pas_foto: null,
  sim: null,
};

const EMPTY_DOC_PROCESSING: Record<DocType, boolean> = {
  cv: false,
  ktp: false,
  pas_foto: false,
  sim: false,
};

const DOC_ICONS: Record<DocType, React.ComponentType<{ className?: string }>> = {
  cv: FileText,
  ktp: IdCard,
  pas_foto: Camera,
  sim: CreditCard,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LamarForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [docFiles, setDocFiles] = useState<Record<DocType, File | null>>(EMPTY_DOC_FILES);
  const [docProcessing, setDocProcessing] = useState<Record<DocType, boolean>>(EMPTY_DOC_PROCESSING);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key as string];
        return n;
      });
    }
  };

  const handleDocFileChange = async (type: DocType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const field = `doc_${type}`;
    const config = DOC_CONFIGS.find((d) => d.type === type);

    setErrors((er) => {
      const n = { ...er };
      delete n[field];
      return n;
    });

    if (!file || !config) {
      setDocFiles((prev) => ({ ...prev, [type]: null }));
      return;
    }

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, [field]: "Hanya file JPG/PNG yang diperbolehkan." }));
      setDocFiles((prev) => ({ ...prev, [type]: null }));
      e.currentTarget.value = "";
      return;
    }

    setDocProcessing((prev) => ({ ...prev, [type]: true }));
    try {
      let finalFile = file;
      if (file.size > MAX_DOC_SIZE_BYTES) {
        const compressed = await imageCompression(file, {
          maxSizeMB: MAX_DOC_SIZE_MB,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.75,
        });
        const baseName = file.name.replace(/\.[^.]+$/, "") || config.type;
        finalFile = new File([compressed], `${baseName}.jpg`, {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      }

      if (finalFile.size > MAX_DOC_SIZE_BYTES) {
        setErrors((er) => ({ ...er, [field]: `Ukuran ${config.label} masih melebihi ${MAX_DOC_SIZE_MB} MB setelah kompresi. Pilih foto yang lebih kecil.` }));
        setDocFiles((prev) => ({ ...prev, [type]: null }));
        e.currentTarget.value = "";
        return;
      }

      setDocFiles((prev) => ({ ...prev, [type]: finalFile }));
    } catch {
      setErrors((er) => ({ ...er, [field]: `Gagal mengompres ${config.label}. Silakan coba file lain.` }));
      setDocFiles((prev) => ({ ...prev, [type]: null }));
      e.currentTarget.value = "";
    } finally {
      setDocProcessing((prev) => ({ ...prev, [type]: false }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!state.nama.trim()) errs.nama = "Nama wajib diisi.";
    if (!state.tanggal_lahir) {
      errs.tanggal_lahir = "Tanggal lahir wajib diisi.";
    } else {
      const age = calculateAge(state.tanggal_lahir);
      if (age < 17) errs.tanggal_lahir = "Umur minimal 17 tahun.";
      if (age > 70) errs.tanggal_lahir = "Tanggal lahir tidak valid.";
    }
    if (!state.alamat.trim()) errs.alamat = "Alamat wajib diisi.";
    if (!state.no_hp.trim()) {
      errs.no_hp = "No telepon wajib diisi.";
    } else if (!isValidPhone(state.no_hp)) {
      errs.no_hp = "Format no telepon tidak valid.";
    }
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errs.email = "Format email tidak valid.";
    }
    if (!state.pendidikan_terakhir) errs.pendidikan_terakhir = "Pendidikan terakhir wajib dipilih.";
    if (!state.posisi_dilamar) errs.posisi_dilamar = "Posisi yang dilamar wajib dipilih.";
    if (state.bisa_nyupir === null) errs.bisa_nyupir = "Wajib dipilih.";
    if (state.bersedia_shift === null) errs.bersedia_shift = "Wajib dipilih.";
    if (state.bersedia_jabodetabek === null) errs.bersedia_jabodetabek = "Wajib dipilih.";

    for (const doc of DOC_CONFIGS) {
      if (!isDocRequired(doc.type, state.posisi_dilamar)) continue;
      if (!docFiles[doc.type]) errs[`doc_${doc.type}`] = `${doc.label} wajib dilampirkan.`;
    }

    setErrors(errs);

    // Scroll ke field error pertama
    if (Object.keys(errs).length > 0) {
      setTimeout(() => {
        const firstField = Object.keys(errs)[0];
        document.querySelector(`[data-field="${firstField}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    // Anti-bot: honeypot harus kosong
    if (state.hp_field) {
      // Diam-diam fail — jangan kasih tahu bot
      router.push("/sukses");
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        const payload: LamarPayload = {
          nama: state.nama.trim(),
          tanggal_lahir: state.tanggal_lahir,
          alamat: state.alamat.trim(),
          email: state.email.trim() || undefined,
          no_hp: state.no_hp.trim(),
          pendidikan_terakhir: state.pendidikan_terakhir,
          posisi_dilamar: state.posisi_dilamar,
          pekerjaan_terakhir: state.pekerjaan_terakhir.trim() || undefined,
          lama_kerja_terakhir: state.lama_kerja_terakhir.trim() || undefined,
          daerah_kerja_terakhir: state.daerah_kerja_terakhir.trim() || undefined,
          status_pernikahan_pelamar: state.status_pernikahan_pelamar || undefined,
          bisa_nyupir: state.bisa_nyupir!,
          bersedia_shift: state.bersedia_shift!,
          bersedia_jabodetabek: state.bersedia_jabodetabek!,
        };
        fd.append("payload", JSON.stringify(payload));
        for (const doc of DOC_CONFIGS) {
          const file = docFiles[doc.type];
          if (file) fd.append(doc.type, file);
        }

        const res = await fetch("/api/lamar", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            setSubmitError(
              `Terlalu banyak percobaan. Coba lagi dalam ${json.retryAfterSec ?? 60} detik.`,
            );
          } else if (json.fieldErrors && Array.isArray(json.fieldErrors)) {
            const errs: Record<string, string> = {};
            for (const e of json.fieldErrors as Array<{ field: string; message: string }>) {
              errs[e.field] = e.message;
            }
            setErrors(errs);
            setSubmitError("Periksa kembali isian form Anda.");
          } else {
            setSubmitError(json.error || "Gagal mengirim lamaran. Silakan coba lagi.");
          }
          return;
        }

        const params = new URLSearchParams();
        if (json.id) params.set("id", String(json.id));
        if (state.nama) params.set("nama", state.nama);
        router.push(`/sukses?${params.toString()}`);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? `Terjadi kesalahan: ${err.message}`
            : "Terjadi kesalahan jaringan. Silakan coba lagi.",
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* ─── Section: Data Diri ─── */}
      <FormSection
        icon={User}
        title="Data Diri"
        description="Isi sesuai dengan KTP."
      >
        <Field label="Nama Lengkap" required name="nama" error={errors.nama}>
          <input
            type="text"
            className={cn("input-field", errors.nama && "has-error")}
            placeholder="Contoh: Budi Santoso"
            value={state.nama}
            onChange={(e) => update("nama", e.target.value)}
            maxLength={200}
            autoComplete="name"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Tanggal Lahir"
            required
            name="tanggal_lahir"
            error={errors.tanggal_lahir}
            hint={
              state.tanggal_lahir && !errors.tanggal_lahir
                ? `Umur: ${calculateAge(state.tanggal_lahir)} tahun`
                : undefined
            }
            icon={Calendar}
          >
            <DatePicker
              value={state.tanggal_lahir}
              onChange={(val) => update("tanggal_lahir", val)}
              max={new Date().toISOString().slice(0, 10)}
              placeholder="Pilih tanggal lahir"
              hasError={!!errors.tanggal_lahir}
            />
          </Field>

          <Field
            label="Status Pernikahan"
            name="status_pernikahan_pelamar"
            icon={Heart}
          >
            <Select
              value={state.status_pernikahan_pelamar}
              onChange={(val) =>
                update(
                  "status_pernikahan_pelamar",
                  val as FormState["status_pernikahan_pelamar"],
                )
              }
              options={[
                { value: "Belum Berkeluarga", label: "Belum Berkeluarga" },
                { value: "Berkeluarga", label: "Berkeluarga" },
              ]}
              placeholder="— Pilih status —"
            />
          </Field>
        </div>

        <Field label="Alamat Tempat Tinggal" required name="alamat" error={errors.alamat} icon={MapPin}>
          <textarea
            className={cn("input-field", errors.alamat && "has-error")}
            placeholder="Alamat lengkap (RT/RW, kelurahan, kota)"
            value={state.alamat}
            onChange={(e) => update("alamat", e.target.value)}
            rows={2}
            maxLength={500}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="No Telepon (WhatsApp)" required name="no_hp" error={errors.no_hp} icon={Phone}>
            <input
              type="tel"
              className={cn("input-field", errors.no_hp && "has-error")}
              placeholder="08xxxxxxxxxx"
              value={state.no_hp}
              onChange={(e) => update("no_hp", e.target.value)}
              autoComplete="tel"
              maxLength={20}
            />
          </Field>

          <Field label="Email (opsional)" name="email" error={errors.email} icon={Mail}>
            <input
              type="email"
              className={cn("input-field", errors.email && "has-error")}
              placeholder="nama@email.com"
              value={state.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              maxLength={200}
            />
          </Field>
        </div>
      </FormSection>

      {/* ─── Section: Latar Belakang ─── */}
      <FormSection
        icon={GraduationCap}
        title="Latar Belakang"
        description="Pendidikan dan posisi yang ingin dilamar."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Pendidikan Terakhir"
            required
            name="pendidikan_terakhir"
            error={errors.pendidikan_terakhir}
          >
            <Select
              value={state.pendidikan_terakhir}
              onChange={(val) => update("pendidikan_terakhir", val)}
              options={PENDIDIKAN_OPTIONS.map((p) => ({ value: p, label: p }))}
              placeholder="— Pilih pendidikan —"
              hasError={!!errors.pendidikan_terakhir}
            />
          </Field>

          <Field
            label="Posisi yang Dilamar"
            required
            name="posisi_dilamar"
            error={errors.posisi_dilamar}
            icon={Briefcase}
          >
            <Select
              value={state.posisi_dilamar}
              onChange={(val) => {
                update("posisi_dilamar", val);
                if (val !== "Driver") {
                  setErrors((er) => {
                    const n = { ...er };
                    delete n.doc_sim;
                    return n;
                  });
                }
              }}
              options={POSISI_OPTIONS.map((p) => ({ value: p, label: p }))}
              placeholder="— Pilih posisi —"
              hasError={!!errors.posisi_dilamar}
            />
          </Field>
        </div>
      </FormSection>

      {/* ─── Section: Pengalaman Kerja ─── */}
      <FormSection
        icon={Briefcase}
        title="Pengalaman Kerja"
        description="Boleh dikosongkan jika belum pernah bekerja."
      >
        <Field label="Pekerjaan Terakhir" name="pekerjaan_terakhir">
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Driver gojek, Helper warehouse"
            value={state.pekerjaan_terakhir}
            onChange={(e) => update("pekerjaan_terakhir", e.target.value)}
            maxLength={200}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Lama Bekerja"
            name="lama_kerja_terakhir"
            icon={Clock}
            hint="Mis. 2 tahun, 6 bulan"
          >
            <input
              type="text"
              className="input-field"
              placeholder="Mis. 2 tahun"
              value={state.lama_kerja_terakhir}
              onChange={(e) => update("lama_kerja_terakhir", e.target.value)}
              maxLength={100}
            />
          </Field>

          <Field
            label="Daerah Pekerjaan Terakhir"
            name="daerah_kerja_terakhir"
            icon={MapPinned}
          >
            <input
              type="text"
              className="input-field"
              placeholder="Mis. Jakarta Timur"
              value={state.daerah_kerja_terakhir}
              onChange={(e) => update("daerah_kerja_terakhir", e.target.value)}
              maxLength={200}
            />
          </Field>
        </div>
      </FormSection>

      {/* ─── Section: Kompetensi & Kesediaan ─── */}
      <FormSection
        icon={Sparkles}
        title="Kompetensi & Kesediaan"
        description="Pertanyaan singkat untuk pencocokan posisi."
      >
        <Field label="Bisa Mengemudi (Nyupir)?" required name="bisa_nyupir" error={errors.bisa_nyupir} icon={Car}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update("bisa_nyupir", true)}
              className={cn("toggle-pill", state.bisa_nyupir === true && "is-active")}
            >
              Bisa
            </button>
            <button
              type="button"
              onClick={() => update("bisa_nyupir", false)}
              className={cn("toggle-pill", state.bisa_nyupir === false && "is-active variant-no")}
            >
              Tidak Bisa
            </button>
          </div>
        </Field>

        <Field
          label="Bersedia Kerja Shift?"
          required
          name="bersedia_shift"
          error={errors.bersedia_shift}
          hint="Sistem kerja kami menggunakan shift bergantian."
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update("bersedia_shift", true)}
              className={cn("toggle-pill", state.bersedia_shift === true && "is-active")}
            >
              Ya, Bersedia
            </button>
            <button
              type="button"
              onClick={() => update("bersedia_shift", false)}
              className={cn("toggle-pill", state.bersedia_shift === false && "is-active variant-no")}
            >
              Tidak Bersedia
            </button>
          </div>
        </Field>

        <Field
          label="Bersedia Ditempatkan di Area Jabodetabek?"
          required
          name="bersedia_jabodetabek"
          error={errors.bersedia_jabodetabek}
          icon={MapPinned}
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update("bersedia_jabodetabek", true)}
              className={cn("toggle-pill", state.bersedia_jabodetabek === true && "is-active")}
            >
              Ya, Bersedia
            </button>
            <button
              type="button"
              onClick={() => update("bersedia_jabodetabek", false)}
              className={cn("toggle-pill", state.bersedia_jabodetabek === false && "is-active variant-no")}
            >
              Tidak Bersedia
            </button>
          </div>
        </Field>
      </FormSection>

      {/* ─── Section: Lampiran ─── */}
      <FormSection
        icon={FileText}
        title="Dokumen Pelamar"
        description={`CV, KTP, dan Pas Foto wajib. SIM Mobil wajib khusus Driver. JPG/PNG maksimal ${MAX_DOC_SIZE_MB} MB, otomatis dikompres.`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DOC_CONFIGS.map((doc) => {
            const Icon = DOC_ICONS[doc.type];
            const file = docFiles[doc.type];
            const processing = docProcessing[doc.type];
            const required = isDocRequired(doc.type, state.posisi_dilamar);
            const fieldName = `doc_${doc.type}`;
            const error = errors[fieldName];

            return (
              <div key={doc.type} data-field={fieldName}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {doc.label}
                    {required && <span className="text-danger">*</span>}
                  </label>
                  {doc.type === "sim" && !required && (
                    <span className="text-[10px] font-bold text-slate-400">khusus Driver</span>
                  )}
                </div>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => void handleDocFileChange(doc.type, e)}
                    disabled={processing || isPending}
                    className="hidden"
                  />
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-all min-h-[126px] flex flex-col items-center justify-center",
                      processing
                        ? "border-blue-500/40 bg-blue-50 cursor-wait"
                        : file
                          ? "border-emerald-500/40 bg-emerald-50"
                          : error
                            ? "border-red-500/40 bg-red-50"
                            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50",
                    )}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-7 h-7 mx-auto mb-2 text-blue-600 animate-spin" />
                        <p className="text-sm font-bold text-blue-800">Mengompres...</p>
                        <p className="text-xs font-medium text-blue-500 mt-1">Mohon tunggu sebentar</p>
                      </>
                    ) : file ? (
                      <>
                        <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                        <p className="text-sm font-bold text-slate-900 max-w-full truncate">{file.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          {formatFileSize(file.size)} · klik untuk ganti
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm font-bold text-slate-700">Pilih {doc.label}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">JPG/PNG · maksimal {MAX_DOC_SIZE_MB} MB</p>
                      </>
                    )}
                  </div>
                </label>
                {error && (
                  <p className="mt-2 text-xs text-danger flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>

      {/* Honeypot — tersembunyi untuk anti-bot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, opacity: 0, pointerEvents: "none" }}>
        <label>
          Jangan diisi
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={state.hp_field}
            onChange={(e) => update("hp_field", e.target.value)}
          />
        </label>
      </div>

      {/* Submit error */}
      {submitError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all",
            "bg-gradient-to-r from-blue-700 to-blue-900",
            "shadow-lg shadow-blue-900/20",
            "hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mengirim lamaran...
            </>
          ) : (
            <>
              Kirim Lamaran
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-[11px] font-medium text-slate-400 text-center mt-4">
          Dengan menekan tombol ini, Anda menyetujui data dipakai untuk proses rekrutmen.
        </p>
      </div>
    </form>
  );
}

// ─── Reusable subcomponents ───
interface FormSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function FormSection({ icon: Icon, title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-700" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          {description && <p className="text-xs font-medium text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Field({ label, name, required, error, hint, icon: Icon, children }: FieldProps) {
  return (
    <div data-field={name}>
      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-danger flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] font-medium text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
