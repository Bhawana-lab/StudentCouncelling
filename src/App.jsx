import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
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
    collection, 
    query, 
    where, 
    onSnapshot,
    updateDoc
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

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto animate-fade-in-down">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Icon path="M6 18L18 6M6 6l12 12" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};


// --- Authentication Pages ---

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
     <div
  className="w-full min-h-screen flex flex-col justify-center items-center p-4 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>
            <div className="max-w-md w-full mx-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 shadow-2xl rounded-2xl p-8 space-y-6 border border-white border-opacity-20 backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="mt-2 text-sm text-purple-200">
                        {isLogin ? 'Sign in to access your dashboard' : 'Get started with your application'}
                    </p>
                </div>

                <div className="flex justify-center border border-purple-300 rounded-lg p-1 bg-black bg-opacity-30">
                    <button onClick={() => setIsLogin(true)} className={`w-1/2 p-2 rounded-md text-sm font-medium ${isLogin ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-purple-200 hover:bg-purple-800'}`}>
                        Sign In
                    </button>
                    <button onClick={() => setIsLogin(false)} className={`w-1/2 p-2 rounded-md text-sm font-medium ${!isLogin ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-purple-200 hover:bg-purple-800'}`}>
                        Sign Up
                    </button>
                </div>
                
                {error && <p className="bg-red-500 text-white p-3 rounded-lg text-center text-sm">{error}</p>}

                <form className="space-y-6" onSubmit={handleAuthAction}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-black bg-opacity-30 text-white placeholder-purple-200" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-black bg-opacity-30 text-white placeholder-purple-200" />
                    
                    {!isLogin && (
                         <div className="flex items-center">
                            <input id="isAdmin" name="isAdmin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-black bg-opacity-30" />
                            <label htmlFor="isAdmin" className="ml-2 block text-sm text-purple-200">Sign up as Admin</label>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:from-gray-500 disabled:to-gray-600">
                            {loading ? <Spinner /> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-purple-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gradient-to-br from-purple-900 to-blue-900 text-purple-300">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 px-4 border border-purple-300 rounded-lg shadow-lg bg-gradient-to-r from-purple-700 to-blue-700 text-sm font-medium text-white hover:from-purple-800 hover:to-blue-800 disabled:from-gray-500 disabled:to-gray-600">
                         <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 58.4l-64 64c-22.3-21.5-54-35.8-93.5-35.8-73.8 0-134.1 60.3-134.1 134.1s60.3 134.1 134.1 134.1c81.8 0 115.4-53.7 122.5-82.1H248v-68.8h239.9c4.7 26.2 7.2 54.4 7.2 84.9z"></path></svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Student Dashboard ---

const StudentDashboard = ({ user, userData, setUserData }) => {
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', dob: '', phone: '' },
        highSchoolMarks: { math: '', science: '', english: '', hindi: '' },
        twelfthMarks: { physics: '', chemistry: '', math: '' },
        branchChoices: { choice1: '', choice2: '' },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if(userData) {
            setFormData(prev => ({
                personalInfo: userData.personalInfo || prev.personalInfo,
                highSchoolMarks: userData.highSchoolMarks || prev.highSchoolMarks,
                twelfthMarks: userData.twelfthMarks || prev.twelfthMarks,
                branchChoices: userData.branchChoices || prev.branchChoices,
            }));
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value, dataset } = e.target;
        const { category } = dataset;
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const twelfth = formData.twelfthMarks;
            const totalTwelfthMarks = Object.values(twelfth).reduce((sum, mark) => sum + Number(mark || 0), 0);
            
            const fullData = {
                ...formData,
                totalTwelfthMarks,
                applicationStatus: 'submitted',
                email: user.email,
                role: 'student'
            };

            await setDoc(doc(db, "users", user.uid), fullData, { merge: true });
            setUserData(prev => ({...prev, ...fullData}));
        } catch (err) {
            setError('Failed to submit application. Please try again.');
            console.error(err);
        }
        setLoading(false);
    };
    
    const handleAcceptOffer = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { applicationStatus: 'accepted' });
        } catch (err) { console.error(err) }
        setLoading(false);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const receiptNumber = e.target.elements.receipt.value;
        if (!receiptNumber) {
            setError('Please enter a receipt number.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updateDoc(doc(db, "users", user.uid), { 
                applicationStatus: 'paid',
                paymentReceipt: receiptNumber
            });
        } catch (err) { 
            console.error(err);
            setError('Failed to submit receipt.');
        }
        setLoading(false);
    };

    const renderApplicationForm = () => (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl border border-white border-opacity-20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="fullName" placeholder="Full Name" value={formData.personalInfo.fullName} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required />
                    <input type="date" name="dob" placeholder="Date of Birth" value={formData.personalInfo.dob} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required />
                    <input type="tel" name="phone" placeholder="Phone Number" value={formData.personalInfo.phone} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required />
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl border border-white border-opacity-20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-6">High School (10th) Marks</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <input type="number" name="math" placeholder="Math" value={formData.highSchoolMarks.math} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                    <input type="number" name="science" placeholder="Science" value={formData.highSchoolMarks.science} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                    <input type="number" name="english" placeholder="English" value={formData.highSchoolMarks.english} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                    <input type="number" name="hindi" placeholder="Hindi" value={formData.highSchoolMarks.hindi} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl border border-white border-opacity-20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-6">10+2 Marks</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input type="number" name="physics" placeholder="Physics" value={formData.twelfthMarks.physics} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                    <input type="number" name="chemistry" placeholder="Chemistry" value={formData.twelfthMarks.chemistry} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                    <input type="number" name="math" placeholder="Math" value={formData.twelfthMarks.math} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required min="0" max="100"/>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl border border-white border-opacity-20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-6">Branch Choices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <select name="choice1" value={formData.branchChoices.choice1} data-category="branchChoices" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white">
                        <option value="" className="text-gray-400">-- Choice 1 --</option>
                        <option className="text-black">Computer Science</option>
                        <option className="text-black">Electronics Engineering</option>
                        <option className="text-black">Mechanical Engineering</option>
                        <option className="text-black">Civil Engineering</option>
                    </select>
                     <select name="choice2" value={formData.branchChoices.choice2} data-category="branchChoices" onChange={handleChange} className="w-full p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white">
                        <option value="" className="text-gray-400">-- Choice 2 --</option>
                        <option className="text-black">Computer Science</option>
                        <option className="text-black">Electronics Engineering</option>
                        <option className="text-black">Mechanical Engineering</option>
                        <option className="text-black">Civil Engineering</option>
                    </select>
                </div>
            </div>
            
            {error && <p className="text-red-400 text-center text-lg font-semibold">{error}</p>}

            <div className="text-center">
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 transition transform hover:scale-105">
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    );

    const renderStatusView = () => {
        const status = userData.applicationStatus;
        const statusMap = {
            'submitted': { text: 'Application Submitted. Visit after 1 Week.', color: 'blue', icon: 'M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0a2.25 2.25 0 005.168 0V8.177a.75.75 0 011.085-.67l.416.207M2.25 12a8.954 8.954 0 013.532-6.97M15.25 12a8.954 8.954 0 00-3.532-6.97m-9 6.97a8.954 8.954 0 0111.063 0m-11.063 0A8.954 8.954 0 002.25 12z' },
            'allocated': { text: `Congratulations! You have been allocated the ${userData.allocatedBranch} branch., color: 'green', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' `},
            'accepted': { text: `You have accepted the offer. Please proceed to payment., color: 'purple', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'` },
            'paid': { text: `Payment receipt submitted. Awaiting verification from admin., color: 'yellow', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'` },
            'verified': { text:` Payment verified. Your admission is confirmed! Your offer letter is ready., color: 'teal', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'` },
            'completed': { text: `Admission process completed. Welcome!, color: 'green', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.002z'` },
        };
        const currentStatus = statusMap[status];

        return (
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl text-center max-w-2xl mx-auto border border-white border-opacity-20 backdrop-blur-sm">
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-${currentStatus.color}-100 bg-opacity-20`}>
                    <Icon path={currentStatus.icon} className={`h-8 w-8 text-${currentStatus.color}-300`} />
                </div>
                <h3 className="text-2xl font-semibold text-white mt-4">Application Status</h3>
                <p className={`text-lg text-${currentStatus.color}-200 mt-2`}>{currentStatus.text}</p>
                
                {status === 'allocated' && (
                    <button onClick={handleAcceptOffer} disabled={loading} className="mt-6 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 transition transform hover:scale-105">
                        {loading ? 'Accepting...' : 'Accept & Proceed'}
                    </button>
                )}

                {status === 'accepted' && (
                    <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                        <h4 className="font-semibold text-white text-lg">Submit Payment Receipt</h4>
                        <p className="text-sm text-purple-200">Deposit the fee in the bank and enter the transaction/receipt number below.</p>
                        <input name="receipt" type="text" placeholder="Receipt / Transaction Number" className="w-full max-w-sm mx-auto p-3 border border-purple-300 rounded-md bg-black bg-opacity-30 text-white placeholder-purple-200" required />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 transition">
                            {loading ? 'Submitting...' : 'Submit Receipt'}
                        </button>
                    </form>
                )}
                
                {status === 'verified' && (
                     <button onClick={() => updateDoc(doc(db, "users", user.uid), { applicationStatus: 'completed' })} className="mt-6 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg shadow-xl hover:from-teal-700 hover:to-cyan-700 transition transform hover:scale-105">
                        View Offer Letter
                    </button>
                )}

                {status === 'completed' && (
                    <div className="mt-8 p-6 border-2 border-dashed border-purple-400 rounded-lg text-left bg-black bg-opacity-20">
                        <h2 className="text-2xl font-bold text-center text-white">Offer Letter</h2>
                        <p className="mt-4 text-purple-200"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p className="mt-2 text-purple-200"><strong>To:</strong> {userData.personalInfo?.fullName}</p>
                        <p className="mt-4 text-purple-200">Dear {userData.personalInfo?.fullName},</p>
                        <p className="mt-2 text-purple-200">We are pleased to offer you admission to the <strong className="text-white">{userData.allocatedBranch}</strong> program at our institution. Your application stood out, and we believe you will be a valuable addition to our community.</p>
                        <p className="mt-4 text-purple-200">We look forward to welcoming you.</p>
                        <p className="mt-6 font-semibold text-purple-200">Sincerely,<br/>Admissions Office</p>
                    </div>
                )}
            </div>
        );
    };

    return (
      <div
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
    }}
  >
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-4xl font-bold text-white mb-2 text-center">Student Dashboard</h2>
            <p className="text-lg text-purple-200 mb-8 text-center">Welcome, {userData?.personalInfo?.fullName || user.email}</p>
            {
                !userData || !userData.applicationStatus || userData.applicationStatus === 'not_started' 
                ? renderApplicationForm() 
                : renderStatusView()
            }
        </div>
        </div>
    );
};

// --- Admin Dashboard ---

const AdminDashboard = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentsData = [];
            querySnapshot.forEach((doc) => {
                studentsData.push({ id: doc.id, ...doc.data() });
            });
            const sortedStudents = studentsData.sort((a, b) => (b.totalTwelfthMarks || 0) - (a.totalTwelfthMarks || 0));
            setStudents(sortedStudents);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleOpenAllocationModal = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };
    
    const handleOpenVerifyModal = (student) => {
        setSelectedStudent(student);
        setVerifyModalOpen(true);
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        const branch = e.target.elements.branch.value;
        if (!branch || !selectedStudent) return;
        
        await updateDoc(doc(db, "users", selectedStudent.id), {
            allocatedBranch: branch,
            applicationStatus: 'allocated'
        });
        setModalOpen(false);
        setSelectedStudent(null);
    };

    const handleVerifyPayment = async () => {
        if (!selectedStudent) return;
        await updateDoc(doc(db, "users", selectedStudent.id), {
            applicationStatus: 'verified'
        });
        setVerifyModalOpen(false);
        setSelectedStudent(null);
    };
    
    const statusBadge = (status) => {
        const styles = {
            'not_started': 'bg-gray-100 text-gray-800',
            'submitted': 'bg-blue-100 text-blue-800',
            'allocated': 'bg-green-100 text-green-800',
            'accepted': 'bg-purple-100 text-purple-800',
            'paid': 'bg-yellow-100 text-yellow-800',
            'verified': 'bg-teal-100 text-teal-800',
            'completed': 'bg-indigo-100 text-indigo-800'
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles['not_started']}`}>
            {status.replace('_', ' ').toUpperCase()}
        </span>;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
    }}
  >
            <div className="container mx-auto p-4 md:p-8">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Admin Dashboard</h2>
                <div className="bg-gradient-to-br from-purple-900 to-blue-900 shadow-2xl rounded-lg overflow-x-auto border border-white border-opacity-20 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-purple-500">
                        <thead className="bg-gradient-to-r from-purple-800 to-blue-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">12th Marks</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Choices</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-black bg-opacity-30 divide-y divide-purple-600">
                            {students.map((student, index) => (
                                <tr key={student.id} className="hover:bg-purple-900 hover:bg-opacity-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{student.personalInfo?.fullName || 'N/A'}</div>
                                        <div className="text-sm text-purple-200">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{student.totalTwelfthMarks || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                                        1. {student.branchChoices?.choice1 || 'N/A'}<br/>
                                        2. {student.branchChoices?.choice2 || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(student.applicationStatus)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {student.applicationStatus === 'submitted' && (
                                            <button onClick={() => handleOpenAllocationModal(student)} className="text-indigo-300 hover:text-white bg-indigo-700 px-3 py-1 rounded-md">Allocate</button>
                                        )}
                                        {student.applicationStatus === 'paid' && (
                                            <button onClick={() => handleOpenVerifyModal(student)} className="text-green-300 hover:text-white bg-green-700 px-3 py-1 rounded-md">Verify Payment</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Allocate Seat for ${selectedStudent?.personalInfo?.fullName}`}>
                    <form onSubmit={handleAllocate}>
                        <p className="text-purple-200"><strong>12th Marks:</strong> <span className="text-white">{selectedStudent?.totalTwelfthMarks}</span></p>
                        <p className="text-purple-200"><strong>Choice 1:</strong> <span className="text-white">{selectedStudent?.branchChoices?.choice1}</span></p>
                        <p className="text-purple-200"><strong>Choice 2:</strong> <span className="text-white">{selectedStudent?.branchChoices?.choice2}</span></p>
                        <div className="mt-4">
                            <label htmlFor="branch" className="block text-sm font-medium text-purple-200">Select Branch to Allocate</label>
                            <select id="branch" name="branch" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-black bg-opacity-30 text-white">
                                <option className="text-black">{selectedStudent?.branchChoices?.choice1}</option>
                                <option className="text-black">{selectedStudent?.branchChoices?.choice2}</option>
                                <option className="text-black">Computer Science</option>
                                <option className="text-black">Electronics Engineering</option>
                                <option className="text-black">Mechanical Engineering</option>
                                <option className="text-black">Civil Engineering</option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={() => setModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700">Allocate Seat</button>
                        </div>
                    </form>
                </Modal>
                
                <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title={`Verify Payment for ${selectedStudent?.personalInfo?.fullName}`}>
                    <p className="text-purple-200"><strong>Student Name:</strong> <span className="text-white">{selectedStudent?.personalInfo?.fullName}</span></p>
                    <p className="mt-2 text-purple-200"><strong>Receipt Number Submitted:</strong> <span className="font-mono bg-purple-900 bg-opacity-50 p-1 rounded text-white">{selectedStudent?.paymentReceipt}</span></p>
                    <p className="mt-4 text-sm text-purple-300">Please verify this receipt number in the bank records before confirming.</p>
                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setVerifyModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Cancel</button>
                        <button onClick={handleVerifyPayment} className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-md hover:from-green-700 hover:to-teal-700">Confirm Verification</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};


// --- Main App Component ---

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
                // Use onSnapshot to listen for realtime updates
                const unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                });
                return () => unsubDoc(); // Cleanup snapshot listener
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribe(); // Cleanup auth listener
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
       <div
      className="relative w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')"
      }}
    >
            {user && (
                <header className="bg-gradient-to-r from-purple-900 to-blue-900 shadow-2xl w-full">
                    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <span className="font-bold text-xl text-white">Admission Portal</span>
                            </div>
                            <div>
                                <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 shadow-lg">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>
            )}
            <main className="w-full">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;
