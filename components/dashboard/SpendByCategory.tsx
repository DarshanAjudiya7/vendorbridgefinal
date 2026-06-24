export type CategoryDataProps = {
  name: string;
  percent: number;
  color: string;
  dot: string;
};

export default function SpendByCategory({ data }: { data: CategoryDataProps[] }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-6 text-base font-semibold text-gray-900">Spend by Category</h3>
      
      <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {data.map((cat, idx) => (
          <div key={idx} style={{ width: `${cat.percent}%` }} className={cat.color} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-y-4">
        {data.map((cat, idx) => (
          <div key={cat.name} className="flex items-center justify-between text-xs pr-4">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
              <span className="text-gray-600 truncate max-w-[90px]">{cat.name}</span>
            </div>
            <span className="font-medium text-gray-900">{cat.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
