## hr_landing — Karir Page Jamslogistic

Public landing page untuk pelamar kerja. Form submission langsung masuk ke tabel `recruitments` di Supabase yang dipakai HR Web.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- Supabase (shared dengan HR Web)
- lucide-react

## Setup

1. Pastikan file `.env.local` berisi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Development server (port 3001 supaya tidak konflik dengan HR Web di 3000):
   ```bash
   npm run dev
   ```

4. Build production:
   ```bash
   npm run build
   npm start
   ```

## Routes

- `/` — Landing + form lamaran
- `/sukses` — Halaman thank-you setelah submit
- `/api/lamar` — POST endpoint, validasi + upload dokumen pelamar + insert ke DB

## Keamanan

- Service-role key hanya dipakai di server route (`/api/lamar`).
- Rate limit: 1 submit per IP per 60 detik (in-memory).
- Honeypot field anti-bot.
- Validasi server-side untuk semua field + dokumen (JPG/PNG + size 2 MB).
- Auto-compress gambar di client sebelum submit.
- Dokumen wajib: CV, KTP, Pas Foto. SIM Mobil wajib khusus posisi Driver.

## Database

Project Supabase yang dipakai sama dengan HR Web. Tabel yang dipakai:
- `recruitments` — insert dengan `sumber_lamaran = 'landing'`
- Storage bucket `recruitment-docs` — upload dokumen ke folder:
  - `cv/`
  - `ktp/`
  - `pas-foto/`
  - `sim/`

Kolom dokumen yang diisi:
- `cv_url`
- `ktp_url`
- `pas_foto_url`
- `sim_url` (khusus Driver jika upload SIM Mobil)
