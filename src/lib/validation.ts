/**
 * Validasi shared antara form client dan server route.
 * Server route HARUS re-validasi karena client validation bisa di-bypass.
 */

export const ALLOWED_CV_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
export const MAX_CV_SIZE_MB = 5;
export const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

export const PENDIDIKAN_OPTIONS = [
  "SD",
  "SMP",
  "SMA/SMK",
  "Diploma",
  "S1",
  "S2",
  "Lainnya",
] as const;

export const POSISI_OPTIONS = [
  "Driver",
  "Helper",
  "Lainnya",
] as const;

export const SIM_OPTIONS = ["Tidak Ada", "A", "B1", "B2"] as const;

/** Hitung umur dari tanggal lahir (YYYY-MM-DD). */
export function calculateAge(tglLahir: string): number {
  if (!tglLahir) return 0;
  const birth = new Date(tglLahir);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Validasi nomor HP Indonesia dasar: 10–15 digit, mulai 0 atau 62. */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s+\-()]/g, "");
  return /^(0|62)\d{9,14}$/.test(cleaned);
}

/** Bentuk error validasi seragam. */
export interface ValidationError {
  field: string;
  message: string;
}

export interface LamarPayload {
  nama: string;
  tanggal_lahir: string; // YYYY-MM-DD
  alamat: string;
  email?: string;
  no_hp: string;
  pendidikan_terakhir: string;
  posisi_dilamar: string;
  pekerjaan_terakhir?: string;
  lama_kerja_terakhir?: string;
  daerah_kerja_terakhir?: string;
  status_pernikahan_pelamar?: string; // "Berkeluarga" | "Belum Berkeluarga"
  bisa_nyupir: boolean;
  sim?: string; // "A" | "B1" | "B2" | "Tidak Ada"
  bersedia_shift: boolean;
  bersedia_jabodetabek: boolean;
}

export function validatePayload(payload: Partial<LamarPayload>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!payload.nama?.trim()) errors.push({ field: "nama", message: "Nama wajib diisi." });
  if (payload.nama && payload.nama.length > 200) errors.push({ field: "nama", message: "Nama terlalu panjang." });

  if (!payload.tanggal_lahir) {
    errors.push({ field: "tanggal_lahir", message: "Tanggal lahir wajib diisi." });
  } else {
    const age = calculateAge(payload.tanggal_lahir);
    if (age < 17) errors.push({ field: "tanggal_lahir", message: "Umur minimal 17 tahun." });
    if (age > 70) errors.push({ field: "tanggal_lahir", message: "Tanggal lahir tidak valid." });
  }

  if (!payload.alamat?.trim()) errors.push({ field: "alamat", message: "Alamat wajib diisi." });
  if (!payload.no_hp?.trim()) {
    errors.push({ field: "no_hp", message: "No telepon wajib diisi." });
  } else if (!isValidPhone(payload.no_hp)) {
    errors.push({ field: "no_hp", message: "Format no telepon tidak valid (10–15 digit, mulai 0 atau 62)." });
  }

  if (payload.email && payload.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push({ field: "email", message: "Format email tidak valid." });
  }

  if (!payload.pendidikan_terakhir) {
    errors.push({ field: "pendidikan_terakhir", message: "Pendidikan terakhir wajib dipilih." });
  } else if (!PENDIDIKAN_OPTIONS.includes(payload.pendidikan_terakhir as (typeof PENDIDIKAN_OPTIONS)[number])) {
    errors.push({ field: "pendidikan_terakhir", message: "Pilihan pendidikan tidak valid." });
  }

  if (!payload.posisi_dilamar) {
    errors.push({ field: "posisi_dilamar", message: "Posisi yang dilamar wajib dipilih." });
  } else if (!POSISI_OPTIONS.includes(payload.posisi_dilamar as (typeof POSISI_OPTIONS)[number])) {
    errors.push({ field: "posisi_dilamar", message: "Pilihan posisi tidak valid." });
  }

  if (typeof payload.bisa_nyupir !== "boolean") {
    errors.push({ field: "bisa_nyupir", message: "Pilih bisa atau tidak bisa nyupir." });
  }

  if (typeof payload.bersedia_shift !== "boolean") {
    errors.push({ field: "bersedia_shift", message: "Pilih kesediaan kerja shift." });
  }

  if (typeof payload.bersedia_jabodetabek !== "boolean") {
    errors.push({ field: "bersedia_jabodetabek", message: "Pilih kesediaan ditempatkan di Jabodetabek." });
  }

  if (payload.sim && !SIM_OPTIONS.includes(payload.sim as (typeof SIM_OPTIONS)[number])) {
    errors.push({ field: "sim", message: "Pilihan SIM tidak valid." });
  }

  if (payload.status_pernikahan_pelamar &&
    !["Berkeluarga", "Belum Berkeluarga"].includes(payload.status_pernikahan_pelamar)) {
    errors.push({ field: "status_pernikahan_pelamar", message: "Pilihan status pernikahan tidak valid." });
  }

  return errors;
}
