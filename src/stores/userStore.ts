import { create } from "zustand";

// A basic user type definition. You can expand this as needed.
type User = {
  name: string;
  email: string;
} | null;

interface UserState {
  user: User;
  setUser: (user: User) => void;
}

// The 'get' parameter is removed as it was unused.
export const useUser = create<UserState>((set) => ({
  user: null,
  // The setUser function now uses 'set' to update the state.
  setUser: (newUser) => set({ user: newUser }),
}));