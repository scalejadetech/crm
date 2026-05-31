import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAYxkecykMA8Td5wkNN5XZ1r7KfJHdW8yk",
  authDomain: "customer-relation-4cace.firebaseapp.com",
  projectId: "customer-relation-4cace",
  storageBucket: "customer-relation-4cace.firebasestorage.app",
  messagingSenderId: "966998290680",
  appId: "1:966998290680:web:fbbfd5856d60dd35608b0d",
  measurementId: "G-1XZRHK4L1K",
  databaseURL: "https://customer-relation-4cace-default-rtdb.firebaseio.com",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const rtdb = getDatabase(app)
