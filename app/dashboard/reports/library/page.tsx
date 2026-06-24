export default function ReportsLibraryPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reports Library</h1>
        <p className="text-slate-500">The central repository for all your exported and scheduled reports is under construction.</p>
      </div>
    </div>
  );
}
