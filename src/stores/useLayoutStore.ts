import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isSidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarWidth: (width: number) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      sidebarWidth: 260, // Default width
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(width, 480)) }), // Min 200px, Max 480px
    }),
    {
      name: 'kobeanai-layout-storage', // persists to localStorage
    }
  )
);
