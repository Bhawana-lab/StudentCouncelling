
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
  
} from 'firebase/auth';
import { 
    getFirestore, 
   
} from 'firebase/firestore';



export const firebaseConfig = {
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


export const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

export const Spinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto animate-fade-in-down transform transition-all duration-300 scale-100">
                <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <Icon path="M6 18L18 6M6 6l12 12" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};
