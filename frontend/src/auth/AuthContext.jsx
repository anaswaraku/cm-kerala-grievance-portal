import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, login, logoutRequest, registerCitizen } from "../services/api";
import { mismatchMessage } from "./roles";

const STORAGE_KEY = "cmGrievanceSession";

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const storeSession = useCallback((nextSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  useEffect(() => {
    const token = session?.token;
    if (!token) {
      setReady(true);
      return undefined;
    }

    let active = true;
    getCurrentUser(token)
      .then(({ user }) => {
        if (!active) return;
        storeSession({ token, user });
      })
      .catch((error) => {
        if (active && error.status === 401) clearSession();
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [session?.token, clearSession, storeSession]);

  const signIn = useCallback(async ({ email, password, expectedRole }) => {
    const result = await login({ email, password });
    if (expectedRole && result.user.role !== expectedRole) {
      throw new Error(mismatchMessage(expectedRole));
    }
    storeSession({ token: result.token, user: result.user });
    return result.user;
  }, [storeSession]);

  const register = useCallback(async (details) => {
    const result = await registerCitizen(details);
    storeSession({ token: result.token, user: result.user });
    return result.user;
  }, [storeSession]);

  const signOut = useCallback(async () => {
    const token = session?.token;
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // The session ends on this device even if the server is unreachable.
      }
    }
    clearSession();
  }, [session?.token, clearSession]);

  const value = useMemo(
    () => ({ session, ready, signIn, register, signOut }),
    [session, ready, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
