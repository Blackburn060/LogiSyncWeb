import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_GOOGLE_APIKEY,
  authDomain: "logisync-060.firebaseapp.com",
  projectId: "logisync-060",
  storageBucket: "logisync-060.appspot.com",
  messagingSenderId: "180377972310",
  appId: "1:180377972310:web:fc62d7c6354c219e6015f7",
  measurementId: "G-PQDYPKP0MQ"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const analytics = getAnalytics(app);