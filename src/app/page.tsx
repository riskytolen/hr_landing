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
      <div className="fixed inset-0 -z-10 bg-slate-50">
        {/* Ambient orbs - smaller for mobile perf */}
        <div className="absolute -top-32 -left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-100/60 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-100/60 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-blue-50/80 blur-[120px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
      </div>

      {/* ─── Navbar ─── */}
      <nav className="relative px-5 sm:px-8 pt-6 pb-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 sm:h-12 relative flex items-center">
              <Image 
                src="/logo-new.png" 
                alt="Jamslogistic" 
                width={180} 
                height={48} 
                className="object-contain w-auto h-full" 
                priority
              />
            </div>
          </div>
          <a
            href="#form"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-blue-800 text-xs font-semibold hover:bg-slate-50 hover:border-blue-200 transition-colors"
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
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Lowongan Terbuka
              </span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in delay-100 text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-5">
              Bangun Karir Anda
              <br />
              Bersama{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">
                Jamslogistic.
              </span>
            </h1>

            {/* Description */}
            <p className="animate-fade-in delay-200 text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Kami membuka lamaran untuk Driver, Helper, Staf Office, dan Maintenance. 
              Isi formulir, tim HR akan menghubungi Anda.
            </p>

            {/* CTA */}
            <div className="animate-fade-in delay-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12 sm:mb-16">
              <a
                href="#form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5"
              >
                Daftar Sekarang
                <ArrowDown className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proses cepat, langsung diproses HR</span>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard icon={MapPin} label="Area Kerja" value="Jabodetabek" delay="delay-100" />
            <InfoCard icon={Truck} label="Posisi" value="4 Posisi" delay="delay-200" />
            <InfoCard icon={Clock} label="Sistem Kerja" value="Shift" delay="delay-300" />
            <InfoCard icon={Zap} label="Proses" value="Cepat" delay="delay-400" />
          </div>
        </div>
      </section>

      {/* ─── Why Join ─── */}
      <section className="relative px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
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
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm text-[11px] font-bold uppercase tracking-wider mb-4">
              Form Lamaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Isi Data Anda
            </h2>
            <p className="text-slate-500 text-sm">
              Lengkapi formulir berikut. Tanda <span className="text-danger">*</span> wajib diisi.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-xl shadow-slate-200/50 p-5 sm:p-8">
            <LamarForm />
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium mt-8">
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
    <div className={`animate-fade-in-up ${delay} p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all`}>
      <Icon className="w-4 h-4 text-blue-600 mb-2" />
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className="text-[13px] font-extrabold text-slate-900 mt-0.5">{value}</p>
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
    <div className={`animate-fade-in-up ${delay} group p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all`}>
      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
        <Icon className="w-4.5 h-4.5 text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <p className="text-sm font-extrabold text-slate-900 mb-1.5">{title}</p>
      <p className="text-xs text-slate-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
