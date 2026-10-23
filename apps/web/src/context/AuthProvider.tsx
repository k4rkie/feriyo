import { type ReactNode, useState, useEffect } from "react";
import { AuthContext, type AuthContextType, type User } from "./auth-context";

type AuthProviderPropType = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderPropType) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_BACKEND_URL}/api/auth/refresh`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response.ok) return;

        const result = await response.json();
        if (!isMounted) return;

        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
      } catch {
        if (!isMounted) return;
        setUser(null);
        setAccessToken(null);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  function login(userData: User, token: string) {
    setUser(userData);
    setAccessToken(token);
  }

  async function logout() {
    await fetch(`${import.meta.env.VITE_BASE_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setAccessToken(null);
  }

  function updateUser(userData: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
