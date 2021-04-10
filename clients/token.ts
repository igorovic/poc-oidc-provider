import express from "express";
import openId = require("openid-client");
import colors from "colors";
import { custom } from "openid-client";
import { HttpProxyAgent } from "hpagent";

const PORT = 3000;
const code_verifier = openId.generators.codeVerifier();
const app = express();

const CLIENT = {
  client_id: "foo",
  client_secret: "bar",
};

// site config
const siteHostname = "site.local";
const callbackUrl = `https://${siteHostname}/cb`;

// provider
const providerHostname = "provider.local";

// globals
let client: openId.Client;
let authorizeUrl: string;
let TokenSet: openId.TokenSet;
let endSessionUrl: string;
let state: string = "123-456";

const code_challenge = openId.generators.codeChallenge(code_verifier);

custom.setHttpOptionsDefaults({
  agent: {
    http: new HttpProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      scheduling: "lifo",
      proxy: "http://127.0.0.1:37819", // <= burp suite proxy
    }),
  },
});

const Issuer = new openId.Issuer({
  issuer: `http://${providerHostname}/`,
  authorization_endpoint: `http://${providerHostname}/auth`,
  token_endpoint: `http://${providerHostname}/token`,
  userinfo_endpoint: `http://${providerHostname}/me`,
});

client = new Issuer.Client({
  client_id: CLIENT.client_id,
  client_secret: CLIENT.client_secret,
  redirect_uris: [callbackUrl],
  response_types: ["id_token token"],
});

/**
 * Start oAuth flow
 */
app.get("/login", async function (req, res) {
  authorizeUrl = client.authorizationUrl({
    scope: "profile email openid",
    //code_challenge,
    //code_challenge_method: "S256",
    //state,
    nonce: "789",
  });
  console.log("authorize url:", colors.cyan(`${authorizeUrl}`), " \n");
  res.redirect(302, authorizeUrl);
});

// callback handler
app.get("/cb", function (req, res) {
  console.log("callback");
  const params = client.callbackParams(req);
  console.log(colors.cyan("req params"), params);
  if (params.error) {
    console.log("Authorization server error: %s", params.error);
    params.error_description ? console.log(params.error_description) : null;
    res.send(
      `<h1>Authorization server Error</h1><br><pre>${params.error.toString()}\n ${
        params.error_description
      }</pre>`
    );
  }
  client
    .oauthCallback(callbackUrl, params, {
      code_verifier,
      state,
      response_type: "id_token token",
    }) // => Promise
    .then(function (tokenSet) {
      TokenSet = tokenSet;
      if (TokenSet) {
        console.log(colors.cyan("received and validated tokens"));
        console.log("%o", tokenSet);
        console.log(
          "acces_token Expires in: %s ",
          colors.cyan(String(TokenSet.expires_in))
        );
        try {
          console.log("TokenSet Claims: %o", tokenSet.claims());
        } catch (err) {
          console.warn(err.message);
        }
      }
    })
    .catch(function (err) {
      console.error(err.message);
      res.send(`<h1>Error</h1><br><pre>${err.toString()}</pre>`);
    });
});

/**
 * Start local server on PORT
 */
app.listen(PORT, () => {
  console.log(colors.green(`site.local server listen on ${PORT}`));
});
