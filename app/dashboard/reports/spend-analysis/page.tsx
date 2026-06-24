export default function SpendAnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Spend Analysis</h1>
        <p className="text-slate-500">Advanced spend categorizations and forecasting tools are coming soon to this page.</p>
      </div>
    </div>
  );
}
