"use client";
import { Menu, Search, Bell } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { setIsOpen } = useSidebar();

  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications/count')
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) {
            setNotificationCount(data.count);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const userImage = session?.user?.image;
  const userName = session?.user?.name || 'User';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:px-8">
      {/* Left side: Mobile menu button (hidden on desktop) */}
      <div className="flex items-center">
        <button 
          type="button" 
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex flex-1 items-center justify-end gap-x-6">
        <div className="flex flex-1 justify-end max-w-md px-4">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full rounded-full border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-gray-50"
              placeholder="Search anything..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button type="button" className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              {userImage ? (
                <img
                  className="h-8 w-8 rounded-full bg-gray-50 object-cover"
                  src={userImage}
                  alt={userName}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase">
                  {userName.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
