require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const querystring = require("querystring");
app.use(cors());
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/", (req, res) => {
  const data = {
    name: "helo",
  };

  res.json(data);
});

app.get("/login", async (req, res) => {
  var scope = "user-read-private user-read-email";
  var state = await generateRandomString(16);
  var authorizeUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      state: state,
      scope: scope,
    });

  res.redirect(301, authorizeUrl);
});
app.get("/callback", (req, res) => {
  res.send("Callback");
});

app.listen(8080, () => {
  console.log(`Express is running at http:localhost`);
});


const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {

  }
};

const signInWithMicrosoft = async () => {
  try {
    const res = await signInWithPopup(auth, microsoftProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "microsoft",
        email: user.email,
      });
    }
  } catch (err) {

  }
}

const logInWithEmailAndPassword = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {

    }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      authProvider: "local",
      email: user.email,
    });
  } catch (err) {

  }
};