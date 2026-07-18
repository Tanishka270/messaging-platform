import React, { useEffect, useRef, useState, useContext } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, db, googleProvider } from "../components/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const readyUserRef = useRef(null);
  const authWaitersRef = useRef([]);

  const resolveAuthenticatedUser = (authenticatedUser) => {
    readyUserRef.current = authenticatedUser;
    authWaitersRef.current = authWaitersRef.current.filter((waiter) => {
      if (waiter.uid === authenticatedUser.uid) {
        waiter.resolve(authenticatedUser);
        return false;
      }
      return true;
    });
  };

  const loginWithGoogle = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (readyUserRef.current?.uid === result.user.uid) {
        return readyUserRef.current;
      }

      return await new Promise((resolve) => {
        authWaitersRef.current.push({ uid: result.user.uid, resolve });
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const startGuestSession = async (guestUser) => {
    // A guest session must not coexist with a persisted Firebase session.
    if (auth.currentUser) {
      await signOut(auth);
    }

    const finalGuestUser = { ...guestUser, isGuest: true };
    localStorage.setItem("guestUser", JSON.stringify(finalGuestUser));
    readyUserRef.current = null;
    setUser(finalGuestUser);
    setLoading(false);
  };

  useEffect(() => {
    //Firebase listener
    const unsub = auth.onAuthStateChanged(async (u) => {
      setLoading(true);

      if (u) {
        // The callback may be finishing after a sign-out or account switch.
        if (auth.currentUser?.uid !== u.uid) return;

        localStorage.removeItem("guestUser");
        readyUserRef.current = null;
        let userData = {};

        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          userData = snap.exists() ? snap.data() : {};

          await setDoc(
            doc(db, "users", u.uid),
            {
              uid: u.uid,
              username: snap.exists()
                ? snap.data().username
                : (u.displayName || u.email?.split("@")[0]),
              email: u.email,
              photoURL: u.photoURL || "",
              createdAt: serverTimestamp(),
              isOnline: true,
              lastSeen: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (error) {
          // Authentication should still complete when the profile write is delayed.
          console.error("Unable to load or update the user profile:", error);
        }

        // Ignore stale async Firestore work after another auth-state change.
        if (auth.currentUser?.uid !== u.uid) return;

        const finalUser = {
          uid: u.uid,
          email: u.email,
          photoURL: u.photoURL,
          username:
            userData.username ||
            u.displayName ||
            u.email?.split("@")[0],
          ...userData,
          isGuest: false,
        };

        setUser(finalUser);
        setLoading(false);
        resolveAuthenticatedUser(finalUser);
      } else {
        const guest = localStorage.getItem("guestUser");

        try {
          setUser(guest ? { ...JSON.parse(guest), isGuest: true } : null);
        } catch {
          localStorage.removeItem("guestUser");
          setUser(null);
        }

        readyUserRef.current = null;
        setLoading(false);
      }
    });


    
    //  handleOffline function add ,  Page close / refresh hone par offline mark
const handleOffline = async () => {
  if (auth.currentUser) {
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        isOnline: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }
};
 //Browser close / refresh detect
window.addEventListener("beforeunload", handleOffline);


    // 🧹Cleanup,firebase listener remove
return () => {
  window.removeEventListener("beforeunload", handleOffline);
  unsub();
};

  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, startGuestSession }}>
      {children}
    </AuthContext.Provider>
  );
};
