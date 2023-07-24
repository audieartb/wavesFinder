const functions = require("firebase-functions");
const server = require("./src/server");
const cors = require("cors")({ origin: true });
const api = functions
  .runWith({ memory: "256MB", timeoutSeconds: 120 })
  .https.onRequest(server);

createStripeCheckout = functions.https.onCall(async (data) => {
  console.log("this is it");
  cors(data, () => {
    console.log(data);
  }).catch((error) => console.log(error));
});

module.exports = { api, createStripeCheckout };
