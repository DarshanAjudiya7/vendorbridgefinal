"use client";
import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  isOpen: false,
  setIsOpen: (val: boolean) => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
