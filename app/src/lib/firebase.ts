// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD-YGsKLwGLLOCRLZCRc1tO1jlVmeY9TQc",
  authDomain: "interrogation-room.firebaseapp.com",
  projectId: "interrogation-room",
  storageBucket: "interrogation-room.firebasestorage.app",
  messagingSenderId: "488803469381",
  appId: "1:488803469381:web:e7687b4c35db39032c3b2c",
  measurementId: "G-N8RVNDGL6G"
};

// Initialize Firebase (Client-side)
export const app = initializeApp(firebaseConfig);