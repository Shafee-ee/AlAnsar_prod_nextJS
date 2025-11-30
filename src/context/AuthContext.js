import { createContext, useContext, useState, useEffect } from "react";
import {
    auth,
    db,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    doc,
    getDoc,
    appId
} from "../../libs/firebase";

// -----------------------------
//  Context Setup
// -----------------------------
const AuthContext = createContext({
    user: null,
    userId: null,
    role: "standard",
    loading: true,
    signIn: async () => { },
    logout: async () => { },
    isAdmin: false,
    adminUidsPath: "/admin_uids",
    appId: null
});

// -----------------------------
//  Provider
// -----------------------------
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState("standard");
    const [loading, setLoading] = useState(true);

    // check Firestore role
    const checkRole = async (uid) => {
        if (!uid) return "standard";

        try {
            const ref = doc(db, "admin_uids", uid);
            const snap = await getDoc(ref);
            return snap.exists() ? "admin" : "standard";
        } catch (err) {
            console.error("Role check error:", err);
            return "standard";
        }
    };

    // auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (current) => {
            if (current) {
                const uid = current.uid;
                setUser(current);
                setUserId(uid);

                const r = await checkRole(uid);
                setRole(r);
            } else {
                setUser(null);
                setUserId(null);
                setRole("standard");
            }

            setLoading(false);
        });

        return () => unsub();
    }, []);

    // login
    const signIn = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    // logout
    const logout = async () => {
        return await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userId,
                role,
                loading,
                signIn,
                logout,
                isAdmin: role === "admin",
                adminUidsPath: "/admin_uids",
                appId
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// -----------------------------
//  Hook
// -----------------------------
export const useAuth = () => useContext(AuthContext);
