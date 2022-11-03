import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8yjM9Crvg_s8-QF856pIsVBJXuzIc_CE",
  authDomain: "mymoviepicker.firebaseapp.com",
  databaseURL: "https://mymoviepicker-default-rtdb.firebaseio.com",
  projectId: "mymoviepicker",
  storageBucket: "mymoviepicker.appspot.com",
  messagingSenderId: "4708053847",
  appId: "1:4708053847:web:7b1945c7c772b69caf8412",
  measurementId: "G-B68XDF7GHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);