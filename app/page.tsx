import Link from "next/link";
import { ArrowRight, Hexagon, Zap, ChevronRight, BarChart3, Layers, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen selection:bg-emerald-500/30 overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px]" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-teal-800/20 blur-[120px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dbvzq21ig/image/upload/v1714488390/grid-pattern_q5m9s7.svg')] bg-center opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-xl bg-slate-950/60 border-b border-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay"></div>
            <Hexagon size={22} fill="currentColor" className="drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              VendorBridge
              <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">Beta</span>
            </h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full rounded-full"></span>
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors relative group">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full rounded-full"></span>
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors relative group">
            Testimonials
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full rounded-full"></span>
          </a>
        </div>
        <div className="flex items-center gap-5">
          <Link 
            href="/login" 
            className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center lg:px-12 min-h-screen">
        
        {/* Animated pill */}
        <div className="group inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-900/50 px-4 py-1.5 text-sm font-medium text-emerald-300 mb-8 backdrop-blur-md hover:border-emerald-500/50 transition-colors cursor-pointer">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Introducing Smart RFQs v2.0
          <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[5rem] leading-[1.1] mb-6">
          Procurement, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Beautifully Automated.
          </span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
          Unify your vendor management, automate purchase orders, and centralize approvals in one powerful, brilliantly designed platform.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center gap-2">
              Start Building Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link 
            href="#demo"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 text-base font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:border-slate-600 w-full sm:w-auto backdrop-blur-sm"
          >
            <LayoutDashboard size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            View Live Demo
          </Link>
        </div>

        {/* Dashboard Mockup Element */}
        <div id="demo" className="mt-20 w-full max-w-5xl relative scroll-mt-32">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-2 shadow-2xl">
            <div className="rounded-xl border border-white/5 bg-slate-950/50 overflow-hidden relative">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs font-medium text-slate-500 font-mono">vendorbridge.app/dashboard</div>
                <div className="w-16"></div> {/* Spacer for balance */}
              </div>
              
              {/* Fake UI Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                 {/* Sidebar Mock */}
                 <div className="hidden md:flex flex-col gap-4">
                    <div className="h-8 w-3/4 bg-slate-800 rounded-md animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-slate-800/50 rounded-md"></div>
                    <div className="h-4 w-2/3 bg-slate-800/50 rounded-md"></div>
                    <div className="h-4 w-1/2 bg-slate-800/50 rounded-md"></div>
                 </div>
                 {/* Main Content Mock */}
                 <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-end">
                        <div className="h-6 w-1/3 bg-emerald-500/40 rounded mt-auto"></div>
                      </div>
                      <div className="h-24 flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-end">
                        <div className="h-6 w-1/4 bg-slate-700 rounded mt-auto"></div>
                      </div>
                    </div>
                    <div className="h-40 w-full bg-slate-800/20 border border-slate-700/50 rounded-xl p-4">
                      <div className="h-4 w-1/4 bg-slate-700/50 rounded mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-3 w-full bg-slate-800 rounded"></div>
                        <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
                        <div className="h-3 w-full bg-slate-800 rounded"></div>
                      </div>
                    </div>
                 </div>
              </div>
              
              {/* Overlay Gradient to fade bottom */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-5xl mx-auto w-full relative z-20">
          
          <div className="group relative rounded-2xl bg-slate-900/50 border border-white/5 p-8 text-left transition-all hover:bg-slate-800/50 hover:border-emerald-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={64} className="text-emerald-400" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="text-xl text-white font-semibold mb-3">Lightning Fast RFQs</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Generate, send, and automatically compare quotes from multiple vendors in minutes instead of days.</p>
          </div>

          <div className="group relative rounded-2xl bg-slate-900/50 border border-white/5 p-8 text-left transition-all hover:bg-slate-800/50 hover:border-blue-500/30 backdrop-blur-sm overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers size={64} className="text-blue-400" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h3 className="text-xl text-white font-semibold mb-3">Centralized Orders</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Track all your purchase orders in one place. Say goodbye to messy email threads and lost spreadsheets.</p>
          </div>

          <div className="group relative rounded-2xl bg-slate-900/50 border border-white/5 p-8 text-left transition-all hover:bg-slate-800/50 hover:border-purple-500/30 backdrop-blur-sm overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 size={64} className="text-purple-400" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl text-white font-semibold mb-3">Actionable Insights</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Enterprise-grade analytics to track spending, vendor performance, and find cost-saving opportunities.</p>
          </div>

        </div>

      </main>

    </div>
  );
}
