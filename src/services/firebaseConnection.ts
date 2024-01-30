import { initializeApp } from "firebase/app";

import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAW4AkXIbeFsQkmT6_7Pf2amcmJpVlJdc0",
  authDomain: "web-carros-8e429.firebaseapp.com",
  projectId: "web-carros-8e429",
  storageBucket: "web-carros-8e429.appspot.com",
  messagingSenderId: "880585464027",
  appId: "1:880585464027:web:6bb1121e2a7e56f9de14fe"
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }