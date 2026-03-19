import {
  createContext,
  type ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  login: (user: User, auth: string) => void;
  logout: () => void;
};

type AuthProviderPropType = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: AuthProviderPropType) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function initializeAuth() {
      try {
        const response = await fetch("http://localhost:8080/api/auth/refresh", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          console.warn("Refresh failed, keeping user state unchanged");
          return;
        }
        const result = await response.json();
        if (!isMounted) return;

        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
      } catch (error) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsAuthLoading(false);
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
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setAccessToken(null);
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
