import { create } from "zustand";

export const useUser = create((set, get) => ({
  user: null,
  setUser: () => {},
}));
