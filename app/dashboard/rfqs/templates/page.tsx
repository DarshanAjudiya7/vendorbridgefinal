export default function RFQTemplatesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>RFQs</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-medium">RFQ Templates</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RFQ Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and use your saved templates for quick RFQ creation.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500">The "RFQ Templates" feature is currently under construction.</p>
      </div>
    </div>
  );
}
