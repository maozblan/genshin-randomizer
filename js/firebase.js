// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_LpeXO2qD8SZDfujdYnl1-66btZ_T1kE",
  authDomain: "mzbl-genshinrandomizer.firebaseapp.com",
  projectId: "mzbl-genshinrandomizer",
  storageBucket: "mzbl-genshinrandomizer.appspot.com",
  messagingSenderId: "690526962598",
  appId: "1:690526962598:web:a4f65e292cf7982382c567",
  measurementId: "G-KZSBB4H50T"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);