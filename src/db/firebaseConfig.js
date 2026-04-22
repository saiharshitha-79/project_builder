import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your final deployed Firebase credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app-name.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app-name.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
