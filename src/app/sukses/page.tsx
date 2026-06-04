export const runtime = 'edge';

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowLeft, Mail, Sparkles } from "lucide-react";

interface SuksesPageProps {
  searchParams: Promise<{ id?: string; nama?: string }>;
}

export default async function SuksesPage({ searchParams }: SuksesPageProps) {
  const params = await searchParams;
  const id = params.id;
  const nama = params.nama;
  const refCode = id ? `JL-${String(id).padStart(5, "0")}` : null;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-12">
      <div className="fixed inset-0 -z-10 bg-slate-50">
        <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-100/60 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-100/60 blur-[100px]" />
      </div>

      <div className="relative max-w-md w-full">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 p-8 sm:p-10 text-center backdrop-blur-md shadow-xl shadow-slate-200/50 overflow-hidden animate-scale-in">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20" style={{ width: "72px", height: "72px" }}>
              <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Lamaran Terkirim!
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
              {nama ? (
                <>
                  Terima kasih, <span className="font-bold text-slate-900">{nama}</span>. Lamaran Anda
                  sudah masuk ke sistem rekrutmen kami.
                </>
              ) : (
                <>Terima kasih. Lamaran Anda sudah masuk ke sistem rekrutmen kami.</>
              )}
            </p>

            {/* Reference code */}
            {refCode && (
              <div className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Kode Referensi
                </p>
                <p className="text-lg font-mono font-extrabold text-blue-700 tabular-nums">{refCode}</p>
              </div>
            )}

            {/* Next steps */}
            <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <p className="text-[12px] font-extrabold text-slate-900">Langkah Selanjutnya</p>
              </div>
              <ul className="space-y-2 text-[12px] text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 flex-shrink-0 font-bold">1.</span>
                  Tim HR akan meninjau berkas Anda dalam beberapa hari kerja.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 flex-shrink-0 font-bold">2.</span>
                  Jika lolos seleksi awal, kami akan menghubungi via WhatsApp ke nomor yang Anda daftarkan.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 flex-shrink-0 font-bold">3.</span>
                  Pastikan nomor HP Anda aktif dan dapat dihubungi.
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-sm font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>

            {/* Brand footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-3">
              <Image 
                src="/logo-new.png" 
                alt="Jamslogistic" 
                width={120} 
                height={32} 
                className="object-contain opacity-70" 
              />
              <p className="text-[11px] text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} Hak Cipta Dilindungi
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
