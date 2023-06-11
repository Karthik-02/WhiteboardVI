import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAW_0IUnvhoGQ00167CuWPBmNu9TfTKt1o",
    authDomain: "vidboard-50f6f.firebaseapp.com",
    projectId: "vidboard-50f6f",
    storageBucket: "vidboard-50f6f.appspot.com",
    messagingSenderId: "78676136323",
    appId: "1:78676136323:web:54a54c9e8d41b5902526b6",
    measurementId: "G-MD43B9FQFD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

