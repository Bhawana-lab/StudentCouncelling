import React, { useState, useEffect } from 'react';
import { getAuth} from 'firebase/auth';
import { setDoc, doc, getFirestore, updateDoc, } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { Modal, Icon } from './Auth.jsx';

const firebaseConfig = {
  apiKey: "AIzaSyCmCLO4BYJ4Sg6EGPNzeBgP6k8ga-4j-gw",
  authDomain: "student-councelling-125ce.firebaseapp.com",
  projectId: "student-councelling-125ce",
  storageBucket: "student-councelling-125ce.firebasestorage.app",
  messagingSenderId: "1027652575741",
  appId: "1:1027652575741:web:7bafae5270503b16e23994",
  measurementId: "G-W4YTB7Q75S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

    if (formData.branchChoices.choice1 && formData.branchChoices.choice2 && 
        formData.branchChoices.choice1 === formData.branchChoices.choice2) {
        setError("You cannot select the same branch for both choices. Please make Chnages in your Branch.");
        setLoading(false);
        return;
    }

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
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-br from-white/90 to-indigo-50/50 p-8 rounded-3xl shadow-xl border border-indigo-100 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-xl mr-3">
                        <Icon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" className="w-6 h-6 text-indigo-600" />
                    </div>
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="fullName" placeholder="Full Name" value={formData.personalInfo.fullName} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" name="dob" placeholder="Date of Birth" value={formData.personalInfo.dob} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" name="phone" placeholder="Phone Number" value={formData.personalInfo.phone} data-category="personalInfo" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-white/90 to-purple-50/50 p-8 rounded-3xl shadow-xl border border-purple-100 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-xl mr-3">
                        <Icon path="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533z" className="w-6 h-6 text-purple-600" />
                    </div>
                    High School (10th) Marks
                </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Math</label>
                        <input type="number" name="math" placeholder="Math" value={formData.highSchoolMarks.math} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Science</label>
                        <input type="number" name="science" placeholder="Science" value={formData.highSchoolMarks.science} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">English</label>
                        <input type="number" name="english" placeholder="English" value={formData.highSchoolMarks.english} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Hindi</label>
                        <input type="number" name="hindi" placeholder="Hindi" value={formData.highSchoolMarks.hindi} data-category="highSchoolMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-white/90 to-blue-50/50 p-8 rounded-3xl shadow-xl border border-blue-100 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-xl mr-3">
                        <Icon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18.75c1.052 0 2.062.18 3 .512V6.042z" className="w-6 h-6 text-blue-600" />
                    </div>
                    10+2 Marks
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Physics</label>
                        <input type="number" name="physics" placeholder="Physics" value={formData.twelfthMarks.physics} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Chemistry</label>
                        <input type="number" name="chemistry" placeholder="Chemistry" value={formData.twelfthMarks.chemistry} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Math</label>
                        <input type="number" name="math" placeholder="Math" value={formData.twelfthMarks.math} data-category="twelfthMarks" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required min="0" max="100"/>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-white/90 to-green-50/50 p-8 rounded-3xl shadow-xl border border-green-100 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="bg-green-100 p-3 rounded-xl mr-3">
                        <Icon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" className="w-6 h-6 text-green-600" />
                    </div>
                    Branch Choices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Choice 1</label>
                        <select name="choice1" value={formData.branchChoices.choice1} data-category="branchChoices" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300" required>
                            <option value="">-- Choice 1 --</option>
                            <option>Computer Science</option>
                            <option>Electronics Engineering</option>
                            <option>Mechanical Engineering</option>
                            <option>Civil Engineering</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Choice 2</label>
                        <select name="choice2" value={formData.branchChoices.choice2} data-category="branchChoices" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300" required>
                            <option value="">-- Choice 2 --</option>
                            <option>Computer Science</option>
                            <option>Electronics Engineering</option>
                            <option>Mechanical Engineering</option>
                            <option>Civil Engineering</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {error && <p className="text-red-500 text-center font-bold">{error}</p>}

            <div className="text-center">
                <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-indigo-300 transition-all duration-300 transform hover:scale-105 text-lg">
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    );

    const renderStatusView = () => {
        const status = userData.applicationStatus;
        const statusMap = {
            'submitted': { text: 'Application Submitted. Visit after 1 Week.', color: 'blue', icon: 'M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0a2.25 2.25 0 005.168 0V8.177a.75.75 0 011.085-.67l.416.207M2.25 12a8.954 8.954 0 013.532-6.97M15.25 12a8.954 8.954 0 00-3.532-6.97m-9 6.97a8.954 8.954 0 0111.063 0m-11.063 0A8.954 8.954 0 002.25 12z' },
            'allocated': { text: `Congratulations! You have been allocated the ${userData.allocatedBranch} branch.`, color: 'green', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            'accepted': { text: `You have accepted the offer. Please proceed to payment.`, color: 'purple', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
            'paid': { text: `Payment receipt submitted. Awaiting verification from admin.`, color: 'yellow', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
            'verified': { text: `Payment verified. Your admission is confirmed! Your offer letter is ready.`, color: 'teal', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            'completed': { text: `Admission process completed. Welcome!`, color: 'green', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.002z' },
        };
        const currentStatus = statusMap[status];

        return (
            <div className="bg-gradient-to-br from-white/90 to-indigo-50/50 p-8 rounded-3xl shadow-2xl text-center max-w-2xl mx-auto border border-indigo-100 backdrop-blur-sm animate-fade-in">
                <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-${currentStatus.color}-100 mb-6`}>
                    <Icon path={currentStatus.icon} className={`h-10 w-10 text-${currentStatus.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Application Status</h3>
                <p className={`text-lg text-gray-700 mb-8 font-bold`}>{currentStatus.text}</p>
                
                {status === 'allocated' && (
                    <button onClick={handleAcceptOffer} disabled={loading} className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 transition-all duration-300 transform hover:scale-105">
                        {loading ? 'Accepting...' : 'Accept & Proceed'}
                    </button>
                )}

                {status === 'accepted' && (
                    <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-6">
                        <h4 className="font-bold text-xl text-gray-800">Submit Payment Receipt</h4>
                        <p className="text-sm text-gray-600">Deposit the fee in the bank and enter the transaction/receipt number below.</p>
                        <div className="max-w-md mx-auto">
                            <input name="receipt" type="text" placeholder="Receipt / Transaction Number" className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50" required />
                        </div>
                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:from-purple-600 hover:to-indigo-700 disabled:from-purple-300 transition-all duration-300 transform hover:scale-105">
                            {loading ? 'Submitting...' : 'Submit Receipt'}
                        </button>
                    </form>
                )}
                
                {status === 'verified' && (
                     <button onClick={() => updateDoc(doc(db, "users", user.uid), { applicationStatus: 'completed' })} className="mt-6 px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
                        View Offer Letter
                    </button>
                )}

                {status === 'completed' && (
                    <div className="mt-8 p-8 border-4 border-dashed border-indigo-300 rounded-3xl bg-gradient-to-br from-indigo-50/50 to-white/50 backdrop-blur-sm">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                                <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Admission Offer Letter</h2>
                        <p className="mt-4 text-gray-700"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p className="mt-2 text-gray-700"><strong>To:</strong> {userData.personalInfo?.fullName}</p>
                        <p className="mt-6 text-gray-700">Dear {userData.personalInfo?.fullName},</p>
                        <p className="mt-4 text-gray-700">We are pleased to offer you admission to the <strong className="font-bold text-indigo-600">{userData.allocatedBranch}</strong> program at our institution. Your application stood out, and we believe you will be a valuable addition to our community.</p>
                        <p className="mt-6 text-gray-700">We look forward to welcoming you.</p>
                        <p className="mt-8 font-bold text-gray-800">Sincerely,<br/>Admissions Office</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
            
            <div className="container mx-auto p-4 md:p-8 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Student Dashboard</h2>
                    <p className="text-lg text-gray-600">Welcome, <span className="font-bold text-indigo-600">{userData?.personalInfo?.fullName || user.email}</span></p>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mt-3 rounded-full"></div>
                </div>
                
                {
                    !userData || !userData.applicationStatus || userData.applicationStatus === 'not_started' 
                    ? renderApplicationForm() 
                    : renderStatusView()
                }
            </div>
        </div>
    );
};
export default StudentDashboard;