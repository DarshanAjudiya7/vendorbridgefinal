export default function ProcurementTrendsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Procurement Trends</h1>
        <p className="text-slate-500">Historical data analysis and market procurement trends will be available here shortly.</p>
      </div>
    </div>
  );
}
