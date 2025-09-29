import React, { useState, useEffect, useMemo } from 'react';
import AuthPage from './AuthPage.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc,  
    onSnapshot,
} from 'firebase/firestore';

// // --- Firebase Configuration ---

const firebaseConfig = {
  apiKey: "AIzaSyCmCLO4BYJ4Sg6EGPNzeBgP6k8ga-4j-gw",
  authDomain: "student-councelling-125ce.firebaseapp.com",
  projectId: "student-councelling-125ce",
  storageBucket: "student-councelling-125ce.firebasestorage.app",
  messagingSenderId: "1027652575741",
  appId: "1:1027652575741:web:7bafae5270503b16e23994",
  measurementId: "G-W4YTB7Q75S"
};

// // --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Components ---

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

 const Spinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
);

function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
               
                const unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                });
                return () => unsubDoc(); 
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribe(); 
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
        }

        if (!user) {
            return <AuthPage />;
        }
        
        if (userData?.role === 'admin') {
            return <AdminDashboard user={user} />;
        }
        
        if(userData?.role === 'student'){
            return <StudentDashboard user={user} userData={userData} setUserData={setUserData} />;
        }
        
        // Fallback for user with no role data yet
        return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
    };
    
    return (
        <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen font-sans">
            {user && (
                <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <div className="bg-white/30 p-2 rounded-lg mr-3 backdrop-blur-sm">
                                    <Icon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18.75c1.052 0 2.062.18 3 .512V6.042z" className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-xl text-white">Admission Portal</span>
                            </div>
                            <div>
                                <button onClick={handleSignOut} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg hover:from-rose-600 hover:to-pink-700 shadow-md transition-all duration-300 transform hover:scale-105">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>
            )}
            <main>
                {renderContent()}
            </main>
        </div>
    );
}
export default App;
