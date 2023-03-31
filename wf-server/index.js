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
