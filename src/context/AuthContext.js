import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

async function register(email, password, name) {
  try {
    // 1. Create authentication user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Create Firestore user document
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      email: email,
      name: name,
      status: "pending",
      role: null,
      createdAt: new Date(),
      lastLogin: null
    });

    // 3. Check if this is the first user
    const usersQuery = await getDocs(collection(db, "users"));
    if (usersQuery.size === 1) {
      await updateDoc(userRef, {
        status: "approved",
        role: "admin"
      });
      console.log("First user created as admin");
    }

    return user;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            uid: user.uid,
            ...userDoc.data()
          });
        } else {
          // Create user doc if missing
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            status: "approved", // Auto-approve for testing
            role: "member",     // Default role
            createdAt: new Date()
          });
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            status: "approved",
            role: "member"
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}