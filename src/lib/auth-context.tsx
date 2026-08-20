import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  getStoredUser,
  getAuthToken,
  clearAuth,
  setStoredUser,
  setAuthToken,
  getUserProfile,
  syncFirebaseUserWithBackend,
  completeUserProfile as apiCompleteProfile,
  API_BASE_URL,
} from "./api";
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  emailLinkActionCodeSettings,
  type ConfirmationResult,
} from "./firebase";

const EMAIL_FOR_SIGN_IN_KEY = "visvam_email_for_sign_in";

export type AuthUser = {
  _id: string;
  name: string;
  email?: string;
  role: string;
  phone?: string;
  avatar?: string;
  profileCompleted: boolean;
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
  needsProfileCompletion: boolean;
  // OTP Auth Methods
  sendEmailLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailLink: () => Promise<{ success: boolean; message: string }>;
  sendPhoneOTP: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ success: boolean; message: string; confirmationResult?: ConfirmationResult }>;
  verifyPhoneOTP: (confirmationResult: ConfirmationResult, code: string) => Promise<{ success: boolean; message: string }>;
  // Google
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  // Profile
  completeProfile: (data: { name?: string; phone?: string; address?: any }) => Promise<{ success: boolean; message: string }>;
  skipProfileCompletion: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Helper to process sync response and set state
  const handleSyncResponse = useCallback((syncRes: any, fallbackName?: string, fallbackAvatar?: string): { success: boolean; message: string } => {
    if (syncRes.success && syncRes.data && syncRes.token) {
      const userData: AuthUser = {
        _id: syncRes.data._id,
        name: syncRes.data.name || fallbackName || "Viśvam Member",
        email: syncRes.data.email || undefined,
        role: syncRes.data.role || "user",
        phone: syncRes.data.phone,
        avatar: syncRes.data.avatar || fallbackAvatar || "",
        profileCompleted: syncRes.data.profileCompleted ?? false,
        address: syncRes.data.address,
      };
      setUser(userData);
      setToken(syncRes.token);
      if (!userData.profileCompleted) {
        setNeedsProfileCompletion(true);
      }
      return { success: true, message: syncRes.message || `Welcome, ${userData.name}!` };
    }
    return { success: false, message: syncRes.message || "Authentication failed" };
  }, []);

  // Restore persisted auth on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getAuthToken();
    if (storedUser && storedToken) {
      const u = storedUser as AuthUser;
      setUser(u);
      setToken(storedToken);
      if (!u.profileCompleted) {
        setNeedsProfileCompletion(true);
      }
    }
    setIsLoading(false);
  }, []);

  // ─── Email Link (Magic Link) ────────────────────────────────────
  const sendEmailLink = useCallback(async (email: string) => {
    console.log("✉️ [Email Link Request]: Sending to", email);
    try {
      await sendSignInLinkToEmail(auth, email, emailLinkActionCodeSettings);
      // Store email for when user clicks the link and returns
      if (typeof window !== "undefined") {
        window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
      }
      console.log("✅ [Email Link Sent Successfully]");
      return { success: true, message: "Magic link sent! Check your email inbox." };
    } catch (error: any) {
      console.error("❌ [Email Link Error]:", { code: error?.code, message: error?.message, error });
      const rawMsg = error?.code ? `${error.message || ""} (${error.code})` : (error?.message || String(error));
      return { success: false, message: rawMsg };
    }
  }, []);

  const verifyEmailLink = useCallback(async () => {
    console.log("✉️ [Verify Email Link Request]");
    try {
      if (typeof window === "undefined") return { success: false, message: "Not in browser" };

      const url = window.location.href;
      if (!isSignInWithEmailLink(auth, url)) {
        return { success: false, message: "Not an email sign-in link" };
      }

      let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
      if (!email) {
        // Prompt user for email if opened on different device
        email = window.prompt("Please provide your email for confirmation");
      }
      if (!email) {
        return { success: false, message: "Email is required to complete sign-in" };
      }

      const result = await signInWithEmailLink(auth, email, url);
      const idToken = await result.user.getIdToken();
      console.log("✅ [Email Link Verified]:", result.user.email);

      // Clean up stored email
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);

      // Sync with backend
      const syncRes = await syncFirebaseUserWithBackend(idToken, {
        name: result.user.displayName || undefined,
        avatar: result.user.photoURL || undefined,
      });

      // Clean up URL (remove sign-in params)
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.origin + window.location.pathname);
      }

      return handleSyncResponse(syncRes, result.user.displayName || email.split("@")[0]);
    } catch (error: any) {
      console.error("❌ [Verify Email Link Error]:", { code: error?.code, message: error?.message, error });
      const rawMsg = error?.code ? `${error.message || ""} (${error.code})` : (error?.message || String(error));
      return { success: false, message: rawMsg };
    }
  }, [handleSyncResponse]);

  // ─── Phone OTP ──────────────────────────────────────────────────
  const sendPhoneOTP = useCallback(async (phoneNumber: string, recaptchaContainerId: string) => {
    console.log("📱 [Phone OTP Request]: Sending to", phoneNumber);
    const initVerifierAndSend = async () => {
      // 1. Always clear any existing verifier to prevent "reCAPTCHA already rendered" conflict
      if ((window as any).__recaptchaVerifier) {
        try {
          (window as any).__recaptchaVerifier.clear();
        } catch {}
        (window as any).__recaptchaVerifier = null;
      }

      const container = typeof document !== "undefined" ? document.getElementById(recaptchaContainerId) : null;
      if (!container) {
        throw new Error("Security verification container missing. Please refresh.");
      }
      container.innerHTML = "";

      // 2. Initialize fresh verifier instance
      const recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {
          console.log("🛡️ [reCAPTCHA]: Solved successfully");
        },
        "expired-callback": () => {
          console.warn("⚠️ [reCAPTCHA]: Expired, clearing verifier");
          try {
            recaptchaVerifier.clear();
          } catch {}
          (window as any).__recaptchaVerifier = null;
        },
      });
      (window as any).__recaptchaVerifier = recaptchaVerifier;

      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    };

    try {
      let confirmationResult;
      try {
        confirmationResult = await initVerifierAndSend();
      } catch (firstErr: any) {
        // If reCAPTCHA was in a dirty state, reset and retry once transparently
        if (
          firstErr?.message?.includes("already been rendered") ||
          firstErr?.message?.includes("reCAPTCHA") ||
          firstErr?.message?.includes("placeholder")
        ) {
          console.warn("🔄 [Phone OTP]: Resetting reCAPTCHA and retrying once...");
          confirmationResult = await initVerifierAndSend();
        } else {
          throw firstErr;
        }
      }

      console.log("✅ [Phone OTP Sent Successfully] Confirmation result ready.");
      return {
        success: true,
        message: "OTP sent successfully!",
        confirmationResult,
      };
    } catch (error: any) {
      console.error("❌ [Phone OTP Error]:", { code: error?.code, message: error?.message, error });

      // Clean up verifier and DOM on error
      if ((window as any).__recaptchaVerifier) {
        try { (window as any).__recaptchaVerifier.clear(); } catch {}
        (window as any).__recaptchaVerifier = null;
      }
      const container = typeof document !== "undefined" ? document.getElementById(recaptchaContainerId) : null;
      if (container) {
        container.innerHTML = "";
      }

      // Return real raw error from Firebase
      const rawError = error?.code
        ? `${error.message || ""} (${error.code})`
        : (error?.message || String(error));

      return { success: false, message: rawError };
    }
  }, []);

  const verifyPhoneOTP = useCallback(async (confirmationResult: ConfirmationResult, code: string) => {
    console.log("🔐 [Verify OTP Request]: Submitting code:", code);
    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      const phoneNumber = result.user.phoneNumber || "";
      console.log("✅ [Verify OTP Success]: Phone:", phoneNumber);

      // Sync with backend
      const syncRes = await syncFirebaseUserWithBackend(idToken, {
        name: result.user.displayName || undefined,
      });

      // Clean up reCAPTCHA
      if ((window as any).__recaptchaVerifier) {
        try { (window as any).__recaptchaVerifier.clear(); } catch {}
        (window as any).__recaptchaVerifier = null;
      }

      return handleSyncResponse(syncRes, phoneNumber);
    } catch (error: any) {
      console.error("❌ [Verify OTP Error]:", { code: error?.code, message: error?.message, error });
      const rawError = error?.code
        ? `${error.message || ""} (${error.code})`
        : (error?.message || String(error));
      return { success: false, message: rawError };
    }
  }, [handleSyncResponse]);

  // ─── Google Sign-In ─────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    console.log("🌐 [Google Sign-in Request]: Opening popup...");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      const photoURL = firebaseUser.photoURL || "";
      console.log("✅ [Google Sign-in Success]:", firebaseUser.email);

      const syncRes = await syncFirebaseUserWithBackend(idToken, {
        avatar: photoURL,
        name: firebaseUser.displayName || "",
      });

      return handleSyncResponse(syncRes, firebaseUser.displayName || "Viśvam Member", photoURL);
    } catch (error: any) {
      console.error("❌ [Google Sign-in Error]:", { code: error?.code, message: error?.message, error });
      const rawError = error?.code
        ? `${error.message || ""} (${error.code})`
        : (error?.message || String(error));
      return { success: false, message: rawError };
    }
  }, [handleSyncResponse]);

  // ─── Profile Completion ─────────────────────────────────────────
  const completeProfile = useCallback(async (data: { name?: string; phone?: string; address?: any }) => {
    try {
      const res = await apiCompleteProfile(data);
      if (res.success && res.data) {
        const updatedUser: AuthUser = {
          ...user!,
          name: res.data.name || user?.name || "",
          phone: res.data.phone || user?.phone,
          address: res.data.address || user?.address,
          profileCompleted: true,
        };
        setUser(updatedUser);
        setStoredUser(updatedUser);
        setNeedsProfileCompletion(false);
        return { success: true, message: res.message || "Profile completed!" };
      }
      return { success: false, message: res.message || "Failed to save profile" };
    } catch (error: any) {
      return { success: false, message: error.message || "Network error" };
    }
  }, [user]);

  const skipProfileCompletion = useCallback(() => {
    setNeedsProfileCompletion(false);
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(() => {
    try { firebaseSignOut(auth); } catch { /* ignore */ }
    // Clean up reCAPTCHA
    if (typeof window !== "undefined" && (window as any).__recaptchaVerifier) {
      try { (window as any).__recaptchaVerifier.clear(); } catch {}
      (window as any).__recaptchaVerifier = null;
    }
    clearAuth();
    setUser(null);
    setToken(null);
    setNeedsProfileCompletion(false);
  }, []);

  // ─── Refresh & Update ──────────────────────────────────────────
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
        avatar: res.data.avatar,
        profileCompleted: res.data.profileCompleted ?? false,
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
          avatar: json.data.avatar,
          profileCompleted: json.data.profileCompleted ?? true,
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
        needsProfileCompletion,
        sendEmailLink,
        verifyEmailLink,
        sendPhoneOTP,
        verifyPhoneOTP,
        loginWithGoogle,
        completeProfile,
        skipProfileCompletion,
        updateProfile,
        refreshUser,
        logout,
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
