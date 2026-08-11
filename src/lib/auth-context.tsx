import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  getStoredUser,
  getAuthToken,
  clearAuth,
  setStoredUser,
  setAuthToken,
  getUserProfile,
  syncFirebaseUserWithBackend,
  API_BASE_URL,
} from "./api";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, firebaseSignOut } from "./firebase";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
};

type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted auth on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getAuthToken();
    if (storedUser && storedToken) {
      setUser(storedUser as AuthUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  // Standard Login (Tries Firebase first, fallbacks to direct JWT API)
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Try Firebase Sign In
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const syncRes = await syncFirebaseUserWithBackend(idToken);
      if (syncRes.success && syncRes.data && syncRes.token) {
        const userData: AuthUser = {
          _id: syncRes.data._id,
          name: syncRes.data.name,
          email: syncRes.data.email,
          role: syncRes.data.role,
          phone: syncRes.data.phone,
        };
        setUser(userData);
        setToken(syncRes.token);
        return { success: true, message: syncRes.message || "Welcome back!" };
      }
    } catch {
      /* Firebase failed or placeholder keys - proceed with direct JWT login */
    }

    // Direct JWT backend fallback
    const res = await apiLogin({ email, password });
    if (res.success && res.data && res.token) {
      const userData: AuthUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        phone: res.data.phone,
      };
      setUser(userData);
      setToken(res.token);
      return { success: true, message: res.message || "Login successful" };
    }
    return { success: false, message: res.message || "Login failed" };
  }, []);

  // Register (Tries Firebase first, fallbacks to direct JWT API)
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const syncRes = await syncFirebaseUserWithBackend(idToken);
      if (syncRes.success && syncRes.data && syncRes.token) {
        const userData: AuthUser = {
          _id: syncRes.data._id,
          name: name || syncRes.data.name,
          email: syncRes.data.email,
          role: syncRes.data.role,
          phone: syncRes.data.phone,
        };
        setUser(userData);
        setToken(syncRes.token);
        return { success: true, message: "Account created successfully!" };
      }
    } catch {
      /* Fallback to direct backend registration */
    }

    const res = await apiRegister({ name, email, password });
    if (res.success && res.data && res.token) {
      const userData: AuthUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        phone: res.data.phone,
      };
      setUser(userData);
      setToken(res.token);
      return { success: true, message: res.message || "Registration successful" };
    }
    return { success: false, message: res.message || "Registration failed" };
  }, []);

  // Google Sign-In with Firebase
  const loginWithGoogle = useCallback(async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      const photoURL = firebaseUser.photoURL || "";
      const syncRes = await syncFirebaseUserWithBackend(idToken, {
        avatar: photoURL,
        name: firebaseUser.displayName || "",
      });

      if (syncRes.success && syncRes.data && syncRes.token) {
        const userData: AuthUser = {
          _id: syncRes.data._id,
          name: syncRes.data.name || firebaseUser.displayName || "Harvest Member",
          email: syncRes.data.email || firebaseUser.email || "",
          role: syncRes.data.role || "user",
          phone: syncRes.data.phone,
          avatar: syncRes.data.avatar || firebaseUser.photoURL || "",
        };
        setUser(userData);
        setToken(syncRes.token);
        return { success: true, message: `Welcome, ${userData.name}!` };
      }
      return { success: false, message: syncRes.message || "Google sign-in backend sync failed" };
    } catch (error: any) {
      if (error?.code === "auth/unauthorized-domain" || error?.message?.includes("unauthorized-domain")) {
        return {
          success: false,
          message: "Unauthorized Domain: Please add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized Domains.",
        };
      }
      if (error?.code === "auth/api-key-not-valid" || error?.message?.includes("api-key-not-valid")) {
        return {
          success: false,
          message: "Please restart your frontend dev server (npm run dev) and refresh your browser (Ctrl+Shift+R) to load the new Firebase key.",
        };
      }
      if (error?.code === "auth/operation-not-allowed" || error?.message?.includes("operation-not-allowed")) {
        return {
          success: false,
          message: "Google Sign-In is disabled in your Firebase project. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Google.",
        };
      }
      return { success: false, message: error.message || "Google sign-in popup failed or was closed." };
    }
  }, []);

  const logout = useCallback(() => {
    try { firebaseSignOut(auth); } catch { /* ignore */ }
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getUserProfile();
    if (res.success && res.data) {
      const userData: AuthUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        phone: res.data.phone,
        address: res.data.address,
      };
      setUser(userData);
      setStoredUser(userData);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    try {
      const currentToken = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const userData: AuthUser = {
          _id: json.data._id,
          name: json.data.name,
          email: json.data.email,
          role: json.data.role,
          phone: json.data.phone,
          address: json.data.address,
        };
        setUser(userData);
        setStoredUser(userData);
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: json.message || "Update failed" };
    } catch (error: any) {
      return { success: false, message: error.message || "Network error" };
    }
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
