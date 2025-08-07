// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// This is a try-catch block because enableIndexedDbPersistence can only be called once.
// And during hot-reloads, this file can be executed multiple times.
try {
    enableIndexedDbPersistence(db)
} catch (err: any) {
    if (err.code !== 'failed-precondition') {
        console.error("Error enabling offline persistence: ", err);
    }
}


export { auth, db };
