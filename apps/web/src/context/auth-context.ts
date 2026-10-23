import { createContext, useContext } from "react";

export type User = {
  userId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
};

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  login: (user: User, auth: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }
  return context;
}
