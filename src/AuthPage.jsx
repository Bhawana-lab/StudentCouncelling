import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import bgImage from './assets/Pages/bgImage.png';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { 
    getFirestore, 
    doc,  
    setDoc, 
    getDoc, 
} from 'firebase/firestore';

// --- Firebase Configuration ---

const firebaseConfig = {
  apiKey: "AIzaSyCmCLO4BYJ4Sg6EGPNzeBgP6k8ga-4j-gw",
  authDomain: "student-councelling-125ce.firebaseapp.com",
  projectId: "student-councelling-125ce",
  storageBucket: "student-councelling-125ce.firebasestorage.app",
  messagingSenderId: "1027652575741",
  appId: "1:1027652575741:web:7bafae5270503b16e23994",
  measurementId: "G-W4YTB7Q75S"
};

// --- Initialize Firebase ---
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

const AuthPage = ({ setView }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Create a user profile in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    role: isAdmin ? 'admin' : 'student',
                    applicationStatus: 'not_started',
                });
            }
            // onAuthStateChanged will handle redirect
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                // New user via Google, create profile
                 await setDoc(userDocRef, {
                    email: user.email,
                    role: 'student', // Google sign-up is for students only
                    applicationStatus: 'not_started',
                    displayName: user.displayName,
                });
            }
        } catch(err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col md:flex-row justify-center items-center p-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
            
            <div className="hidden md:block w-1/2 p-12">
                <div className="relative">
                    <img 
                        src={bgImage}
                        alt="Student learning" 
                        className="w-full h-1/2 object-cover rounded-3xl shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Your Academic Journey Starts Here</h2>
                        <p className="text-indigo-200">Join thousands of students who have successfully applied through our platform</p>
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-1/2 max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-6 transform -translate-y-2 transition-all duration-500 border border-indigo-100">
                <div className="text-center">
                    <div className="mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Icon path="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146M9.278 12.75c.13.612.212 1.24.245 1.88.024.45.105.89.24 1.31.31.918.988 1.69 1.86 2.11.45.21.94.34.147.4.105.06.21.09.315.09s.21-.03.315-.09c.043-.03.085-.06.127-.1a5.07 5.07 0 001.86-2.11c.135-.42.216-.86.24-1.31.033-.64.115-1.268.245-1.88M9.278 12.75c.22-.12.45-.23.69-.33.45-.19.94-.33 1.45-.4.51-.07 1.03-.1 1.55-.1.52 0 1.04.03 1.55.1.51.07 1 .21 1.45.4.24.1.47.21.69.33M9.278 12.75c-.12.61-.21 1.23-.25 1.86-.03.45-.02.9.05 1.34.1.59.31 1.13.62 1.6.31.47.72.87 1.2 1.18.48.31 1.02.54 1.6.68.58.14 1.18.2 1.79.2.61 0 1.21-.06 1.79-.2.58-.14 1.12-.37 1.6-.68.48-.31.89-.71 1.2-1.18.31-.47.52-1.01.62-1.6.07-.44.08-.89.05-1.34-.04-.63-.13-1.25-.25-1.86" className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? 'Sign in to access your dashboard' : 'Get started with your application'}
                    </p>
                </div>

                <div className="flex justify-center border-2 border-indigo-100 rounded-xl p-1 bg-indigo-50">
                    <button onClick={() => setIsLogin(true)} className={`w-1/2 p-3 rounded-lg text-sm font-bold transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-indigo-100'}`}>
                        Sign In
                    </button>
                    <button onClick={() => setIsLogin(false)} className={`w-1/2 p-3 rounded-lg text-sm font-bold transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-indigo-100'}`}>
                        Sign Up
                    </button>
                </div>
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center text-sm font-medium">{error}</p>}

                <form className="space-y-5" onSubmit={handleAuthAction}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" />
                    </div>
                    
                    {!isLogin && (
                         <div className="flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <input id="isAdmin" name="isAdmin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="isAdmin" className="ml-3 block text-sm text-gray-900 font-bold">Sign up as Admin</label>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-all duration-300 transform hover:scale-[1.02]">
                            {loading ? <Spinner /> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-bold">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-all duration-300">
                         <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 58.4l-64 64c-22.3-21.5-54-35.8-93.5-35.8-73.8 0-134.1 60.3-134.1 134.1s60.3 134.1 134.1 134.1c81.8 0 115.4-53.7 122.5-82.1H248v-68.8h239.9c4.7 26.2 7.2 54.4 7.2 84.9z"></path></svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AuthPage;