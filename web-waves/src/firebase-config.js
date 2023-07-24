import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
const config = {
  apiKey: "AIzaSyB79uaSiJ2ZoiCn_9vwST272xtPfLYL4h4",
  authDomain: "wavesfinder-5d157.firebaseapp.com",
  databaseURL:
    "https://wavesfinder-5d157-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wavesfinder-5d157",
  storageBucket: "wavesfinder-5d157.appspot.com",
  messagingSenderId: "936776071172",
  appId: "1:936776071172:web:62290787c01e18a4e69d51",
  measurementId: "G-ZCBECRERZK",
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error(
      "No Firebase configuration object provided." +
        "\n" +
        "Add your web app's configuration object to firebase-config.js"
    );
  } else {
    return config;
  }
}
const app = initializeApp(config);
export const auth = getAuth(app);

//const provider = new GoogleAuthProvider();

// export const googleSignInPopup = () => {
//   signInWithPopup(auth, provider)
//     .then((result) => {
//       console.log("this is good", result);
//     })
//     .catch((error) => {
//       console.error("this is bad", error);
//     });
// };
