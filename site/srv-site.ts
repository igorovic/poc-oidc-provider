import express from "express";
import openId = require("openid-client");
import colors from "colors";
import config from "./oidc.config.json";
import { custom } from "openid-client";
import jwt = require("jsonwebtoken");
import { burpProxy } from "../utils/burpProxy";

const PORT = 3000;
const code_verifier = openId.generators.codeVerifier();
console.log("CODE VERIFIER", code_verifier);
const app = express();

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

const code_challenge = openId.generators.codeChallenge(code_verifier);
console.log("CODE CHALLENGE", code_challenge);

custom.setHttpOptionsDefaults({
  agent: {
    http: burpProxy,
  },
});

/**
 * redirects to the Issuer /authorize endpoint
 */
app.get("/login", async function (req, res) {
  const Issuer = new openId.Issuer({
    issuer: `http://${providerHostname}/`,
    authorization_endpoint: `http://${providerHostname}/auth`,
    token_endpoint: `http://${providerHostname}/token`,
    userinfo_endpoint: `http://${providerHostname}/me`,
    jwks_uri: `http://${providerHostname}/jwks`,
  });

  client = new Issuer.Client({
    client_id: config.client_id,
    client_secret: config.client_secret,
    redirect_uris: [callbackUrl],
    response_types: ["code"],
  });

  authorizeUrl = client.authorizationUrl({
    scope: "profile email openid",
    code_challenge,
    code_challenge_method: "S256",
    state: "123-123",
  });
  console.log("authorize url:", colors.cyan(`${authorizeUrl}`), " \n");
  res.redirect(302, authorizeUrl);
});

app.get("/cb", function (req, res) {
  const params = client.callbackParams(req);
  client
    .callback(callbackUrl, params, {
      code_verifier,
      state: "123-123",
      response_type: "code",
    }) // => Promise
    .then(function (tokenSet) {
      TokenSet = tokenSet;
      if (TokenSet) {
        console.log(colors.cyan("received and validated tokens"));
        console.log("%o", tokenSet);
        if (tokenSet.id_token) {
          const decoded = jwt.decode(tokenSet.id_token);
          console.log(colors.bgGreen.red("ID_TOKEN decoded"), decoded);
        }
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
      res.redirect("/userinfo");
    })
    .catch(function (err) {
      res.send(`<h1>Error</h1><br><pre>${err.toString()}</pre>`);
    });
});

app.get("/userinfo", function (req, res) {
  if (TokenSet && TokenSet.access_token) {
    client
      .userinfo(TokenSet.access_token, {
        via: "header",
        tokenType: TokenSet.token_type,
      })
      .then(function (userinfo) {
        res.send(
          `<pre>${JSON.stringify(
            userinfo,
            null,
            2
          )}</pre><br><a href="/logout">logout</a>`
        );
      })
      .catch(function (err) {
        res.send(`<h1>Error</h1><br><pre>${err.toString()}</pre>`);
      });
  } else {
    res.send("<p>Missing access_token</p>");
  }
});

app.get("/logout", function (req, res) {
  endSessionUrl = client.endSessionUrl({
    returnTo: `http://${siteHostname}/`,
    id_token_hint: TokenSet.id_token,
  });
  console.log("end session url:", colors.cyan(`${endSessionUrl}`), " \n");
  res.header("location", endSessionUrl).status(302).send();
});

app.get("/", function (req, res) {
  res.send("<h1>Basic home page</h1><br><p>Nothing to see here</p>");
});

/**
 * Start local server on PORT
 */
app.listen(PORT, () => {
  console.log(colors.green(`site.local server listen on ${PORT}`));
});
