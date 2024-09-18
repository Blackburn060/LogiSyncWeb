import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCyx_yGZrYy_8ZDee3_PwI7Cu2uJVA1nr4",
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