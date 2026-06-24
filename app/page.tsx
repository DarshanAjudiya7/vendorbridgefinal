import Link from "next/link";
import { ArrowRight, Hexagon, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b162c] text-slate-200">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[100px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Hexagon size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">VendorBridge</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0b162c] transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
          >
            Go to Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center lg:px-12 mt-10 sm:mt-0">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Procurement Reimagined v2.0
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-tight">
          Smart Procurement for <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Modern Teams.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed">
          Streamline your vendor management, automate RFQs, and centralize approvals in one powerful, beautifully designed platform.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Enter Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-slate-200 transition-all hover:bg-slate-700 w-full sm:w-auto backdrop-blur-sm"
          >
            Create an Account
          </Link>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto border-t border-white/10 pt-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast RFQs</h3>
            <p className="text-sm text-slate-400">Generate, send, and compare quotes in minutes instead of days.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
              <Globe size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Global Vendor Network</h3>
            <p className="text-sm text-slate-400">Connect with trusted suppliers seamlessly across borders.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-sm text-slate-400">Enterprise-grade security and automated compliance checks.</p>
          </div>
        </div>

      </main>

    </div>
  );
}
