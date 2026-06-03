import Image from "next/image";
import {
  Truck,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowDown,
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import LamarForm from "@/components/LamarForm";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#09090b]" />
        {/* Ambient orbs - smaller for mobile perf */}
        <div className="absolute -top-32 -left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-800/[0.12] blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-blue-800/[0.08] blur-[120px]" />
        {/* Subtle noise grain */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }} />
      </div>

      {/* ─── Navbar ─── */}
      <nav className="relative px-5 sm:px-8 pt-6 pb-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700/15 ring-1 ring-blue-700/25 flex items-center justify-center">
              <Image src="/logo.png" alt="Jamslogistic" width={22} height={22} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Jamslogistic</p>
              <p className="text-[9px] font-semibold text-blue-400/60 tracking-[0.25em] uppercase mt-0.5">
                Karir
              </p>
            </div>
          </div>
          <a
            href="#form"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700/15 border border-blue-700/25 text-blue-300 text-xs font-semibold hover:bg-blue-700/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Lamar Sekarang
          </a>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative px-5 sm:px-8 pt-8 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-700/15 border border-blue-700/25 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Lowongan Terbuka
              </span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in delay-100 text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Bangun Karir Anda
              <br />
              Bersama{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                Jamslogistic.
              </span>
            </h1>

            {/* Description */}
            <p className="animate-fade-in delay-200 text-zinc-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Kami mencari Driver dan Helper berdedikasi untuk pengiriman area Jabodetabek. 
              Isi formulir, tim HR akan menghubungi Anda.
            </p>

            {/* CTA */}
            <div className="animate-fade-in delay-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12 sm:mb-16">
              <a
                href="#form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 text-white text-sm font-bold shadow-lg shadow-blue-800/30 hover:shadow-xl hover:shadow-blue-800/40 transition-all hover:-translate-y-0.5"
              >
                Daftar Sekarang
                <ArrowDown className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Proses cepat, langsung diproses HR</span>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard icon={MapPin} label="Area Kerja" value="Jabodetabek" delay="delay-100" />
            <InfoCard icon={Truck} label="Posisi" value="Driver & Helper" delay="delay-200" />
            <InfoCard icon={Clock} label="Sistem Kerja" value="Shift" delay="delay-300" />
            <InfoCard icon={Zap} label="Proses" value="Cepat" delay="delay-400" />
          </div>
        </div>
      </section>

      {/* ─── Why Join ─── */}
      <section className="relative px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Mengapa Bergabung
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <BenefitCard
              icon={TrendingUp}
              title="Penghasilan Jelas"
              desc="Gaji bulanan + bonus per titik pengiriman."
              delay="delay-100"
            />
            <BenefitCard
              icon={Users}
              title="Tim Profesional"
              desc="Manajemen rapi, absensi modern, payroll tepat."
              delay="delay-200"
            />
            <BenefitCard
              icon={Sparkles}
              title="Karir Jangka Panjang"
              desc="Promosi berdasarkan kinerja yang dinilai objektif."
              delay="delay-300"
            />
            <BenefitCard
              icon={Zap}
              title="Proses Cepat"
              desc="Lamaran masuk, training pendek, langsung kerja."
              delay="delay-400"
            />
          </div>
        </div>
      </section>

      {/* ─── Form ─── */}
      <section id="form" className="relative px-4 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-300 text-[11px] font-bold uppercase tracking-wider mb-4">
              Form Lamaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Isi Data Anda
            </h2>
            <p className="text-zinc-500 text-sm">
              Lengkapi formulir berikut. Tanda <span className="text-danger">*</span> wajib diisi.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-7">
            <LamarForm />
          </div>

          <p className="text-center text-[11px] text-zinc-600 mt-6">
            &copy; {new Date().getFullYear()} Jamslogistic — Karir Center
          </p>
        </div>
      </section>
    </main>
  );
}

// ─── Subcomponents ───
function InfoCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div className={`animate-fade-in-up ${delay} p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors`}>
      <Icon className="w-4 h-4 text-blue-400 mb-2" />
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</p>
      <p className="text-[13px] font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div className={`animate-fade-in-up ${delay} group p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-700/30 hover:bg-zinc-900/80 transition-all`}>
      <div className="w-8 h-8 rounded-lg bg-blue-700/15 flex items-center justify-center mb-3 group-hover:bg-blue-700/25 transition-colors">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <p className="text-sm font-bold text-white mb-1">{title}</p>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}
