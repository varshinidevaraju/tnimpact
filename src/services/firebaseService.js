/**
 * USES: Data persistence and real-time synchronization service.
 * SUPPORT: Integrates Google Firebase for user authentication, cloud-hosted storage of orders, and live updates of fleet status.
 */
import {

    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { db, auth } from "../firebase/config";

// --- AUTHENTICATION SERVICES ---

export const signUp = async (email, password, role) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store extra user info in Firestore
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
        });

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        let role = 'driver'; // default
        querySnapshot.forEach((doc) => {
            role = doc.data().role;
        });

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const q = query(collection(db, "users"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);
            let role = 'driver';
            querySnapshot.forEach((doc) => {
                role = doc.data().role;
            });
            callback({ ...user, role });
        } else {
            callback(null);
        }
    });
};

// --- DATA SERVICES (Orders & Drivers) ---

export const subscribeToOrders = (callback) => {
    const q = collection(db, "orders");
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(orders);
    });
};

export const addOrder = (order) => {
    return addDoc(collection(db, "orders"), {
        ...order,
        createdAt: new Date().toISOString()
    });
};

export const updateOrder = (id, updates) => {
    const orderRef = doc(db, "orders", id);
    return updateDoc(orderRef, updates);
};

export const deleteOrder = (id) => {
    const orderRef = doc(db, "orders", id);
    return deleteDoc(orderRef);
};

export const subscribeToDrivers = (callback) => {
    const q = collection(db, "drivers");
    return onSnapshot(q, (snapshot) => {
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(drivers);
    });
};

export const addDriver = (driver) => {
    return addDoc(collection(db, "drivers"), {
        ...driver,
        createdAt: new Date().toISOString()
    });
};

export const updateDriver = (id, updates) => {
    const driverRef = doc(db, "drivers", id);
    return updateDoc(driverRef, updates);
};
