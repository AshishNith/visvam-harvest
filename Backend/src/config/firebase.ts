import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let firebaseApp: admin.app.App | null = null;

export const initFirebase = (): admin.app.App | null => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const projectId = process.env.FIREBASE_PROJECT_ID || "visvam-1be38";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  try {
    if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
      const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), "utf8"));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[Firebase Admin] Initialized with service account file.");
    } else if (clientEmail && privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("[Firebase Admin] Initialized with environment credentials.");
    } else if (projectId) {
      firebaseApp = admin.initializeApp({
        projectId,
      });
      console.log(`[Firebase Admin] Initialized default app for project: ${projectId}`);
    }
  } catch (error) {
    console.warn("[Firebase Admin] Warning during initialization:", error);
  }

  return firebaseApp;
};

export const verifyFirebaseToken = async (idToken: string) => {
  if (admin.apps.length === 0) {
    initFirebase();
  }
  // Not passing checkRevoked=true: that flag calls getUser() under the hood,
  // which needs real Admin SDK service-account credentials
  // (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) — without them every
  // token verification throws and login fails with 401. Signature and
  // expiry are still fully verified either way.
  return await admin.auth().verifyIdToken(idToken);
};

export { admin };
