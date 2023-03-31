// exports.searchArtist = functions.https.onRequest((req, res) => {
//   cors(req, res, async () => {
//     res.send({ data: "search results" });
//   });
// });

// const SpotifyWebApi = require("spotify-web-api-node");
// const Spotify = new SpotifyWebApi({
//   clientId: CLIENT_ID,
//   clientSecret: CLIENT_SECRET,
//   redirectUri: `http://localhost:5000/callback`,
// });

// exports.requestUserAuth = functions.https.onRequest(async (req, res) => {
//   cookieParser()(req, res, () => {
//     var scope = "user-read-private user-read-email";
//     var scopeOAuth = ["user-read-email"];
//     const state = req.cookies.state || crypto.randomBytes(20).toString("hex");
//     functions.logger.log("Setting verification state:", state);
//     res.cookie("state", state.toString(), {
//       maxAge: 3600000,
//       secure: true,
//       httpOnly: true,
//     });
//     const authorizeURL = Spotify.createAuthorizeURL(
//       scopeOAuth,
//       state.toString()
//     );
//     res.redirect(authorizeURL);
//   });
// });

// exports.requestUserAuth = functions.https.onRequest((req, res) => {
//   cors(req, res, async () => {
//     var scope = "user-read-private user-read-email";
//     var state = await generateRandomString(16);
//     console.log(
//       "https://accounts.spotify.com/authorize?" +
//         querystring.stringify({
//           client_id: CLIENT_ID,
//           response_type: "code",
//           redirect_uri: REDIRECT_URI,
//           state: state,
//           scope: scope,
//         })
//     );
//     res.redirect(
//       "https://accounts.spotify.com/authorize?" +
//         querystring.stringify({
//           client_id: CLIENT_ID,
//           response_type: "code",
//           redirect_uri: REDIRECT_URI,
//           state: state,
//           scope: scope,
//         })
//     );
//   });
// });
// exports.requestUserAuth = functions.https.onRequest(async (req, res) => {
//   var scope = "user-read-private user-read-email";
//   var state = await generateRandomString(16);
//   var authorizeUrl =
//     "https://accounts.spotify.com/authorize?" +
//     querystring.stringify({
//       client_id: CLIENT_ID,
//       response_type: "code",
//       redirect_uri: REDIRECT_URI,
//       state: state,
//       scope: scope,
//     });
//   cors(req, res, () => {
//     res.redirect(301, authorizeUrl);
//   });
// });

// exports.login = functions.https.onCall((req, res) => {
//   cors(req, res, async () => {
//     res.redirect(`https://accounts.spotify.com/authorize?`);
//   });
// });

// async function getAccessTokenold(req, res) {
//   const data = req.body.data;
//   const params = new URLSearchParams();
//   params.append("client_id", data.client_id);
//   params.append("grant_type", "authorization_code");
//   params.append("code", data.code);
//   params.append("redirect_uri", "http://localhost:5000/callback");
//   params.append("code_verifier", data.code_verifier);

//   const result = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: params,
//   }).catch((error) => {
//     console.log(error);
//   });
//   console.log(result);
//   const { acces_token } = await result.json();
//   res.send({ data: result });
// }
async function proxySpotifyToken(_req, res) {
  const code = _req.body.code;
  const refreshToken = _req.body.refresh_token;

  if (!code && !refreshToken) {
    return res.status(403).json({ success: false, data: "Not Authorized" });
  }

  if (refreshToken) {
    spotifyApi.setRefreshToken(refreshToken);
    spotifyApi
      .refreshAccessToken()
      .then(
        (data) => {
          data.body.refreshToken = refreshToken;
          return res.json(data.body);
        },
        (error) => {
          console.log("could not refresh access token", error);
        }
      )
      .catch((error) => {
        return res.json(error);
      });
  }

  if (code) {
    spotifyApi
      .authorizationCodeGrant(code)
      .then((data) => {
        return res.json(data.body);
      })
      .catch((error) => {
        return res.json(error);
      });
  }
}

async function loginSpotifyold(req, res) {
  var scope = "user-read-private user-read-email";
  var challenge = await generateRandomString(128);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  //res.json({ data: scope });
  res.redirect(
    301,
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: scope,
        code_challenge_method: "s256",
        code_challenge: code_challenge_method,
      })
  );
}

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, { ...new Uint8Array(digest) }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
var scope = "user-read-private user-read-email";

async function redirectToAuthCodeFlow(CLIENT_ID) {
  var scope = "user-read-private user-read-email";
  var verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  console.log("here");
  //res.json({ data: scope });
  document.location =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      client_id: client_id,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: scope,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });
}
