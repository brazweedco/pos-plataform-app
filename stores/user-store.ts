import { create } from "zustand";

import { UserInfo } from "@/services/api";

interface UserState {
  user: UserInfo | null;
  isOnline: boolean;
  setUser: (user: UserInfo | null) => void;
  setOnline: (isOnline: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isOnline: true,
  setUser: (user) => set({ user }),
  setOnline: (isOnline) => set({ isOnline }),
  clear: () => set({ user: null, isOnline: false }),
}));
