// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtdJUbobx9lCBZhBaEeWmZCZAct-DjoDo",
  authDomain: "shade-parade.firebaseapp.com",
  projectId: "shade-parade",
  storageBucket: "shade-parade.firebasestorage.app",
  messagingSenderId: "70809880874",
  appId: "1:70809880874:web:a7adb01bcb301e6159b653",
  measurementId: "G-ZC1VMQ5EXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;