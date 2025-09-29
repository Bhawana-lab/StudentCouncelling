import React, { useState, useEffect } from 'react';
import { Modal, Icon} from './Auth.jsx';
import { query,collection, } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {  doc, getFirestore,  where,  onSnapshot, updateDoc } from 'firebase/firestore';

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

 const Spinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
);
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
        return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${styles[status] || styles['not_started']}`}>
            {status.replace('_', ' ').toUpperCase()}
        </span>;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
            
            <div className="container mx-auto p-4 md:p-8 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h2>
                    <p className="text-lg text-gray-600">Manage student applications and admissions</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mt-3 rounded-full"></div>
                </div>
                
                <div className="bg-gradient-to-br from-white/90 to-indigo-50/50 shadow-2xl rounded-3xl overflow-hidden border border-indigo-100 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">12th Marks</th>
                                 <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Choices</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student, index) => (
                                <tr key={student.id} className="hover:bg-indigo-50 transition-all duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{student.personalInfo?.fullName || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{student.totalTwelfthMarks || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        1. {student.branchChoices?.choice1 || 'N/A'}<br/>
                                        2. {student.branchChoices?.choice2 || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(student.applicationStatus)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        {student.applicationStatus === 'submitted' && (
                                            <button onClick={() => handleOpenAllocationModal(student)} className="text-indigo-600 hover:text-indigo-800 font-bold transition-all duration-200 hover:underline">
                                                Allocate
                                            </button>
                                        )}
                                        {student.applicationStatus === 'paid' && (
                                            <button onClick={() => handleOpenVerifyModal(student)} className="text-green-600 hover:text-green-800 font-bold transition-all duration-200 hover:underline">
                                                Verify Payment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Allocate Seat for ${selectedStudent?.personalInfo?.fullName}`}>
                    <form onSubmit={handleAllocate}>
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="font-bold text-gray-700"><strong>12th Marks:</strong> <span className="text-indigo-600">{selectedStudent?.totalTwelfthMarks}</span></p>
                            <p className="font-bold text-gray-700"><strong>Choice 1:</strong> <span className="text-indigo-600">{selectedStudent?.branchChoices?.choice1}</span></p>
                            <p className="font-bold text-gray-700"><strong>Choice 2:</strong> <span className="text-indigo-600">{selectedStudent?.branchChoices?.choice2}</span></p>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="branch" className="block text-sm font-bold text-gray-700">Select Branch to Allocate</label>
                            <select id="branch" name="branch" className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-white/50">
                                <option>{selectedStudent?.branchChoices?.choice1}</option>
                                <option>{selectedStudent?.branchChoices?.choice2}</option>
                                <option>Computer Science</option>
                                <option>Electronics Engineering</option>
                                <option>Mechanical Engineering</option>
                                <option>Civil Engineering</option>
                            </select>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
                                Allocate Seat
                            </button>
                        </div>
                    </form>
                </Modal>
                
                <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title={`Verify Payment for ${selectedStudent?.personalInfo?.fullName}`}>
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="font-bold text-gray-700"><strong>Student Name:</strong> <span className="text-green-600">{selectedStudent?.personalInfo?.fullName}</span></p>
                        <p className="mt-2 font-bold text-gray-700"><strong>Receipt Number Submitted:</strong> <span className="font-mono bg-gray-100 p-2 rounded text-indigo-600">{selectedStudent?.paymentReceipt}</span></p>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">Please verify this receipt number in the bank records before confirming.</p>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={() => setVerifyModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200">Cancel</button>
                        <button onClick={handleVerifyPayment} className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
                            Confirm Verification
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AdminDashboard;