import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiRegister, apiMe } from "../services/api";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("tlm_token"));

  useEffect(() => {
    if (!token) return;
    apiMe(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("tlm_token");
      });
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("tlm_token", data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("tlm_token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("tlm_token");
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};
