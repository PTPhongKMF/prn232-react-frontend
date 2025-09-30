import type { User } from "src/types/account/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  user: User | null;
  setUser: (newUser: User) => void;
}

export const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (newUser) => set({ user: newUser }),
    }),
    { name: "userData" },
  ),
);
