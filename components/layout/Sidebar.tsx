"use client";
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Home, 
  Building2, 
  FileText, 
  ArrowLeftRight, 
  CheckSquare, 
  FileSpreadsheet, 
  Activity, 
  PieChart,
  Hexagon,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Target
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Building2 },
  { 
    name: 'RFQs', 
    icon: FileText,
    href: '/dashboard/rfqs',
    subItems: [
      { name: 'All RFQs', href: '/dashboard/rfqs' },
      { name: 'Create RFQ', href: '/dashboard/rfqs/create' },
      { name: 'My RFQs', href: '/dashboard/rfqs/my' },
      { name: 'RFQ Templates', href: '/dashboard/rfqs/templates' },
    ]
  },
  { name: 'Quotations', href: '/dashboard/quotations', icon: ArrowLeftRight },
  { name: 'Comparison', href: '/dashboard/comparison', icon: Target },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
  { name: 'PO & Invoices', href: '#', icon: FileSpreadsheet },
  { name: 'Logs', href: '#', icon: Activity },
  { name: 'Reports', href: '#', icon: PieChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Hexagon },
];

export default function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [rfqExpanded, setRfqExpanded] = useState(true);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userName = session?.user?.name || 'Guest User';
  const userRole = (session?.user as any)?.role === 'PROCUREMENT_OFFICER' ? 'Procurement Officer' : (session?.user as any)?.role || 'Guest';
  const userInitial = userName.charAt(0);
  const userImage = session?.user?.image;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b162c] text-white transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="flex h-20 items-center justify-between px-6 bg-[#081021]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-lg">
              <Hexagon size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vendor<span className="text-emerald-500">Bridge</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            
            if (item.subItems) {
              const isSectionActive = pathname.startsWith('/dashboard/rfqs');
              return (
                <div key={item.name} className="mb-2">
                  <button
                    onClick={() => setRfqExpanded(!rfqExpanded)}
                    className={`w-full group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isSectionActive && !rfqExpanded ? 'bg-emerald-600/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isSectionActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'} />
                      {item.name}
                    </div>
                    {rfqExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {rfqExpanded && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
                      {item.subItems.map(subItem => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                              isSubActive 
                                ? 'bg-emerald-600 text-white' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !item.subItems);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 bg-[#081021] p-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/settings" className="flex items-center gap-3 group">
              {userImage ? (
                <img src={userImage} alt={userName} className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-emerald-500 transition-colors" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-lg group-hover:bg-emerald-500 transition-colors">
                  {userInitial}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{userName}</p>
                <p className="text-xs font-medium text-emerald-400">{userRole}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
