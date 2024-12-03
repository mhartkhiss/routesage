import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAiLowWG0xgXhu7i17n5qCAzwXwzm2JnMQ",
  authDomain: "routesage-fc1e1.firebaseapp.com",
  databaseURL: "https://routesage-fc1e1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "routesage-fc1e1",
  storageBucket: "routesage-fc1e1.firebasestorage.app",
  messagingSenderId: "1007037149449",
  appId: "1:1007037149449:web:becb06dbfe7ea0561523d8",
  measurementId: "G-X4BZR4SPQF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app); 