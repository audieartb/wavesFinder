import axios from "axios";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
  FieldValue,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { getFirebaseConfig } from "./firebase-config.js";

document.getElementById("search-artist-btn").addEventListener("click", () => {
  const artist = document.getElementById("artist-input").value;

  axios
    .get(
      `http://127.0.0.1:5001/wavesfinder-5d157/us-central1/api/user/search?artist=${artist}`
    )
    .then((res) => {
      clearSearchResults();
      console.log(res.data.results.artists.items);
      const artistList = res.data.results.artists.items;
      showArtists(artistList);
      document.getElementById("load-more-btn").removeAttribute("hidden");
    });
});
document.getElementById("load-more-btn").addEventListener("click", () => {
  const artist = document.getElementById("artist-input").value;
  if (artist) {
    const searchContainer = document.getElementById("artist-search-container");
    var offset = searchContainer.getElementsByTagName("*").length;
    axios
      .get(
        `http://127.0.0.1:5001/wavesfinder-5d157/us-central1/api/user/search?artist=${artist}&offset=${offset}`
      )
      .then((res) => {
        console.log(res.data.results.artists.items);
        const artistList = res.data.results.artists.items;
        if (artistList.length == 0) {
          alert("there's nothing here");
        }
        showArtists(artistList);
      });
  }
});
function replace() {
  console.log("feather");
  feather.replace();
}

async function showArtists(artistList) {
  const user = getCurrentUser();
  var favList = [];
  if (user) {
    console.log("user detected, getting favorites");
    favList = await getFavorites(user.uid);
    console.log(favList.length);
  }

  var container = document.getElementById("artist-search-container");
  for (const i in artistList) {
    var el = artistList[i];
    var favButtonState = "btn-info";
    if (favList.length > 0) {
      console.log("favorites", favList);
      favButtonState = favList.includes(el.id) ? "btn-danger" : "btn-info";
    }
    var imgUrl = el.images.filter((data) => data.height >= 300).at(-1).url;
    var square = document.createElement("div");
    square.classList.add("col");

    var htmlCard = `
    <div class="card text-center d-flex flex-column col-3 m-3" id="${el.id}" style="width: 15rem; height: 25rem">
          <img src="${imgUrl}" style="width: 235px;height:235px" id="img-${el.id}"  class="card-img-top" alt="...">
          <div class="card-body">
          <a href="${el.external_urls.spotify}" target="_blank class="card-title"><h5>${el.name}</h5></a>
            <p class="card-text no-style">${el.followers.total} followers</p>
            <button id="add-favorite-${el.id}" type="button" onclick="addRemoveFavorites('${el.id}')" class="btn ${favButtonState}"><i data-feather="heart"></i></button>
            <button type="button" onclick="getMoreLikeThis('${el.id}')" class="align-self-end btn btn-primary">More like this</button>
          </div>
        </div>`;

    square.innerHTML = htmlCard;
    container.appendChild(square);
    replace();
  }
}

//***********************GOOGLE SIGN IN ***************************/
//SIGNS IN WAVES FINDER
async function signIn() {
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}
//SIGNS OUT
function signOutUser() {
  signOut(getAuth());
}

//INITIALIZE FIREBASE AUTH
function initFirebaseAuth() {
  onAuthStateChanged(getAuth(), authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return getAuth().currentUser.photoURL || "/images/profile_placeholder.png";
}

// Returns the signed-in user's display name.
function getUserName() {
  return getAuth().currentUser.displayName;
}

function isUserSignedIn() {
  return !!getAuth().currentUser;
}
function getCurrentUser() {
  return getAuth().currentUser;
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
    return url + "?sz=150";
  }
  return url;
}
//*********END GOOGLE AUTHORIZATION*************** */

//***************FAVORITES **************** */

function changeFavoriteIcon(id) {
  var favoritesButton = document.getElementById(`add-favorite-${id}`);
  if (favoritesButton.classList.contains("btn-info")) {
    favoritesButton.classList.remove("btn-info");
    favoritesButton.classList.add("btn-danger");
  } else {
    favoritesButton.classList.remove("btn-danger");
    favoritesButton.classList.add("btn-info");
  }
}

async function addRemoveFavorites(artistId) {
  const user = getCurrentUser();
  if (!user) {
    alert("Please sign in first");
    return;
  }
  const userId = user.uid;
  const favList = await getFavorites(userId);

  if (favList.includes(artistId)) {
    removeFavorite(artistId, userId);
  } else {
    addFavorite(artistId, userId);
  }
}

async function addFavorite(artistId, userId) {
  try {
    const favoritesRef = doc(db, "Favorites", userId);
    await updateDoc(favoritesRef, { favorites: arrayUnion(artistId) });
    changeFavoriteIcon(artistId);
  } catch (error) {
    console.log(error);
  }
}

async function removeFavorite(artistId, userId) {
  try {
    const favoritesRef = doc(db, "Favorites", userId);
    await updateDoc(favoritesRef, { favorites: arrayRemove(artistId) });
    changeFavoriteIcon(artistId);
  } catch (error) {
    console.log(error);
  }
}

async function getFavorites(userId) {
  try {
    const favoritesRef = doc(db, "Favorites", userId);

    var docSnap = await getDoc(favoritesRef);
    if (docSnap.exists()) {
      return docSnap.data().favorites;
    } else {
      console.log("error fetching document");
    }
  } catch (error) {
    console.log(error);
  }
}
function clearSearchResults() {
  document.getElementById("artist-search-container").innerHTML = "";
}

document.getElementById("get-favorites").addEventListener("click", async () => {
  const user = getCurrentUser();
  const favList = await getFavorites(user.uid);
  const favListStr = favList.join();

  const favArtists = await axios.get(
    `http://127.0.0.1:5001/wavesfinder-5d157/us-central1/api/user/favorites?artists=${favListStr}`
  );
  clearSearchResults();
  showArtists(favArtists.data.artists);
});

//*************END FAVORITES************* */

//**************GET MORE LIKE THIS*********** */

async function getMoreLikeThis(artist) {
  try {
    const related = await axios.get(
      `http://127.0.0.1:5001/wavesfinder-5d157/us-central1/api/user/related?artist=${artist}`
    );
    console.log();
    const relatedData = related.data.related.artists;
    clearSearchResults();
    showArtists(relatedData);
  } catch (error) {
    console.log("Error getting related", error);
  }
}

//**************END GET MORE LIKE THIS*********** */

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage =
      "url(" + addSizeToGoogleProfilePic(profilePicUrl) + ")";
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute("hidden");
    userPicElement.removeAttribute("hidden");
    signOutButtonElement.removeAttribute("hidden");

    // Hide sign-in button.
    signInButtonElement.setAttribute("hidden", "true");

    // We save the Firebase Messaging Device token and enable notifications.
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute("hidden", "true");
    userPicElement.setAttribute("hidden", "true");
    signOutButtonElement.setAttribute("hidden", "true");

    // Show sign-in button.
    signInButtonElement.removeAttribute("hidden");
  }
}

window.addRemoveFavorites = addRemoveFavorites;
window.getMoreLikeThis = getMoreLikeThis;

var signInButtonElement = document.getElementById("sign-in");
var signOutButtonElement = document.getElementById("sign-out");
var userPicElement = document.getElementById("user-pic");
var userNameElement = document.getElementById("user-name");

signOutButtonElement.addEventListener("click", signOutUser);
signInButtonElement.addEventListener("click", signIn);

feather.replace();
const firebaseAppConfig = getFirebaseConfig();
const app = initializeApp(firebaseAppConfig);
initFirebaseAuth();
const db = getFirestore(app);
