import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDX4blum08aMMxAA6wKH0cL9p0vdL33QVk",
  authDomain: "axdealss.firebaseapp.com",
  databaseURL: "https://axdealss-default-rtdb.firebaseio.com",
  projectId: "axdealss",
  storageBucket: "axdealss.firebasestorage.app",
  messagingSenderId: "667150990929",
  appId: "1:667150990929:web:1d7913a590b683d770c270",
  measurementId: "G-P1Q07REXSQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Auth and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
