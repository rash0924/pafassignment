import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBP25_elKrYJFhgHjasPxtMnrhQOoUBJCA",
  authDomain: "sulayakooo.firebaseapp.com",
  projectId: "sulayakooo",
  storageBucket: "sulayakooo.firebasestorage.app",
  messagingSenderId: "614957945225",
  appId: "1:614957945225:web:3d87056e6aa26181421158",
  measurementId: "G-73VNLQHHEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
