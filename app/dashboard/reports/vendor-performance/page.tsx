export default function VendorPerformancePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Vendor Performance</h1>
        <p className="text-slate-500">This module is currently under development. Check back soon for detailed vendor performance analytics!</p>
      </div>
    </div>
  );
}
