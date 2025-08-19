import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLXfcBpHZsj3_bLLYwlTQfs6Vgdt7m3nw",
  authDomain: "rolegate-61c32.firebaseapp.com",
  projectId: "rolegate-61c32",
  storageBucket: "rolegate-61c32.firebasestorage.app",
  messagingSenderId: "118715272896",
  appId: "1:118715272896:web:084ebdeef1bb579803e725",
  measurementId: "G-GJ2NC0X3MV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };