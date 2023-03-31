var SpotifyWebApi = require("spotify-web-api-node");
const querystring = require("querystring");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const crypto = require("node:crypto");
const functions = require("firebase-functions");
const http = require("node:http");
const axios = require("axios");
const { api } = require("../..");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/callback";
const BASE_URL = "https://api.spotify.com/v1/search";
const ARTIST_URL = "https://api.spotify.com/v1/artists/";

const tokenURL = "https://accounts.spotify.com/api/token";
var authOptions = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  auth: {
    username: CLIENT_ID,
    password: CLIENT_SECRET,
  },
};
const data = {
  grant_type: "client_credentials",
};

var token;

async function getAccessToken() {
  try {
    const response = await axios.post(
      tokenURL,
      querystring.stringify(data),
      authOptions
    );
    return response.data.access_token;
  } catch (error) {
    console.log(error);
  }
}
const wrapInRetry = (apiCallFunc) => {
  return async (...args) => {
    if (!token) {
      token = await getAccessToken();
    }
    try {
      const response = await apiCallFunc(args);
      console.log("try api call ", response);
      return response;
    } catch (error) {
      console.log(error);
      if (error.response.status == 401) {
        try {
          token = await getAccessToken();
          const funcRes = await apiCallFunc(args);
          return funcRes;
        } catch (funcError) {
          console.log(funcError);
        }
      } else {
        console.log(error);
      }
    }
  };
};
var retries = 3;
async function searchArtist(req, res) {
  let artist = req.query.artist;
  let offset = req.query.offset ? req.query.offset : 0;
  const FECTH_URL = `${BASE_URL}?q=artist:${artist}&type=artist&offset=${offset}&limit=10`;
  if (!token) {
    token = await getAccessToken();
  }
  try {
    let searchHeaders = new Headers();
    searchHeaders.append("Authorization", `Bearer ${token}`);

    let artist = await fetch(FECTH_URL, {
      method: "GET",
      headers: searchHeaders,
    });
    if (artist.status == 401) {
      token = await getAccessToken();
      artist = await fetch(FECTH_URL, {
        method: "GET",
        headers: searchHeaders,
      });
    }
    let results = await artist.json();
    console.log(results);
    res.send({ results });
  } catch (error) {
    console.log("error fetching data: ", error);
  }
}

async function getMoreLikeThis(req, res) {
  let artist = req.query.artist;
  const FECTH_URL = `${ARTIST_URL}${artist}/related-artists`;

  if (!token) {
    token = await getAccessToken();
  }

  try {
    let searchHeaders = new Headers();
    searchHeaders.append("Authorization", `Bearer ${token}`);

    let related = await fetch(FECTH_URL, {
      method: "GET",
      headers: searchHeaders,
    });
    if (related.status == 401) {
      token = await getAccessToken();
      related = await fetch(FECTH_URL, {
        method: "GET",
        headers: searchHeaders,
      });
    }
    related = await related.json();
    console.log(related);
    res.send({ related });
  } catch (error) {
    console.log("error getting related: ", error);
  }
}

async function getFavorites(req, res) {
  const artistsIds = req.query.artists;
  console.log(artistsIds);
  if (!token) {
    token = await getAccessToken("Authorization", `Bearer ${token}`);
  }

  try {
    let searchHeaders = new Headers();
    searchHeaders.append("Authorization", `Bearer ${token}`);
    let artistList = await fetch(`${ARTIST_URL}?ids=${artistsIds}`, {
      method: "GET",
      headers: searchHeaders,
    });

    if (artistList.status == 401) {
      token = await getAccessToken();
      artistList = await fetch(`${ARTIST_URL}?ids=${artistsIds}`, {
        method: "GET",
        headers: searchHeaders,
      });
    }

    artistList = await artistList.json();
    res.send(artistList);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  searchArtist,
  getFavorites,
  getMoreLikeThis,
};
