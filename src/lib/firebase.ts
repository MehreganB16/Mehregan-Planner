// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "taskwise-5pn42",
  appId: "1:66073216464:web:9041741ec7629ad03c65d5",
  storageBucket: "taskwise-5pn42.firebasestorage.app",
  apiKey: "AIzaSyCJmhLnFaOt1-931ooa8OUJLcbV0l3g2n8",
  authDomain: "taskwise-5pn42.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "66073216464"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
