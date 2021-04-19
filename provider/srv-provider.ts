import express from "express";
const app = express();
import {
  Provider,
  Configuration,
  KoaContextWithOIDC,
  ResourceServer,
} from "oidc-provider";
import colors from "colors";
import Debug = require("debug");
const dbg = Debug("debug");
const dbgI = dbg.extend("interactions");
const acc = require("./support/account");
const PORT = 8001;

// config
const providerHostname = "provider.local";
const siteHostname = "site.local";

const Resources: { [k: string]: ResourceServer } = {
  "https://site.local/": {
    scope: "orders",
  },
};
const configuration: Configuration = {
  // ... see the available options in Configuration options section
  /* async findAccount(ctx, id) {
    console.log("find accounts");
    return {
      accountId: id,
      async claims(use, scope) {
        return { sub: id };
      },
    };
  }, */
  extraTokenClaims(ctx, token) {
    console.log(colors.bgGreen.red("extraToken Claims"));
    dbg("%O", token);
    return {
      extra: "email",
      claims: ["email"],
    };
  },
  conformIdTokenClaims: false, // default: true
  formats: {
    customizers: {
      async jwt(ctx: any, token: any, jwt: any) {
        dbg(colors.yellow.bgRed("JWT_FORMATER"));
        const newJWT = {
          ...jwt,
          payload: {
            ...jwt.payload,
            extra: "hello",
          },
        };
        return newJWT;
      },
    },
  },
  findAccount: acc.findAccount,
  cookies: {
    keys: [
      "some secret key",
      "and also the old rotated away some time ago",
      "and one more",
    ],
  },
  claims: {
    address: ["address"],
    email: ["email", "email_verified"],
    phone: ["phone_number", "phone_number_verified"],
    //extra: ["my-extra"],
    profile: [
      "birthdate",
      "family_name",
      "gender",
      "given_name",
      "locale",
      "middle_name",
      "name",
      "nickname",
      "picture",
      "preferred_username",
      "profile",
      "updated_at",
      "website",
      "zoneinfo",
    ],
    openid: ["sub", "profile", "email"], // default: ["sub"] - will add those claims to the id_token
  },
  features: {
    devInteractions: { enabled: true }, // defaults to true
    claimsParameter: { enabled: true }, // defaults to false
    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
    introspection: { enabled: true },
    userinfo: { enabled: true }, // when disabled id_token conforms to scope claims
    resourceIndicators: {
      enabled: true,
      async defaultResource(ctx: KoaContextWithOIDC) {
        //if(oneOf) return oneOf;
        dbg("%o", ctx);
        return "https://site.local/";
      },
      async getResourceServerInfo(
        ctx: KoaContextWithOIDC,
        resourceIndicator: string,
        client: any
      ) {
        return Resources[resourceIndicator];
      },
    },
  },
  jwks: {
    keys: [
      {
        kty: "RSA",
        n:
          "uypw8CKN9I6edI58si1fHF3F_ZUtjmArN_rTSq6zuHpTWA81W0LR4Xr_6NT4BOatrm1KlNFp7YrnyH1CO4_I4IkXlyFydvTDesDMFlFVLnB_vJ2ZtHsX8Styg1qdgo-bHJXAwRC94g245m63ZzSnliN1u8iYnO-8DkG4agAbbWGJAEOXxUG-wFlndpb9SgCQGLGFFrxsqfOKrBN0HytuE5W_uR-sKvgulKZ4ftEP_Hl7beLZyh37zFF5OZLDskqZ8ehMP6Slpvme7nJFh3jlhV77qm2pJbZP0HTMJDo_FjNXYZrjlZGWPc5H2_xLEjXvoZxJPJzs0kI_FSNGDXFuDw",
        e: "AQAB",
        d:
          "D9PI9SWW54Vf9O9PsCmSD24GnikNTyrmvLcjQv9_Byyg-6NdmbgO04h5N5E63_851LQ9SFRlJsdGTnf5L9w62nH9YrRbX5_XH_xJxeFe2Kx-wM56_v4hyi0oY983zqCiN0qaoDjwNbt_VU0riTi0q0eYXybZcPv85R-9nokfyKH_uL2o8yep0uoO31vYcm1Kqw5uF_cjZkc_7dv7tn-yMVcPYAXoD2y8Zzc0vqcjbzhCK8qW4PXApklqvYpOKZyGsJClbhzPldj-ny5FYoqrRX3zrx3WyawVxkiz01H6bNp-yKotRBdDwJbjg8S2mMYD6y3P8DSyzJM_xYy7bAkbsQ",
        p:
          "7EiOfKkGj4Qt54IdJnwox-XaT-vJy6XSuQ7x2UXnTuNmk75Nt0zoo_gP1ulYpsCaK5nxh0aE3nW6d5sQJ5ZkpslzdYXItzXO_hfYQL9BmqUQgjIdy8PZxzBKJV49lXEVc8EbidHjg7prUQyNC0MXkFm5mYd9HNB0YkcMq4EdZKU",
        q:
          "ysikfaXbbZGKHMKN_PJY4uHElcjes_tp-n1DKRmX-dEP0fJC8KYJ0k4UL09DSRE0VaVYZLwb26aADBtd8k70oA2aWPRT9DtfFN3ENnKqIt2pyhK1xTMqn_tr3tmsk4bFleCRjcPXGUOcbEtQGTc1b8M7gnAVO_JfoXTpwHuspaM",
        dp:
          "tj4wSE5GVSNqFIny2eAhxCyw-buvZXd81GeGekLEacBTOdkqMBsNxIpsDSLl0Zf0UXTnKaNmj_7V17Kt_xqsf0gZ2adabJUAFlNl5GqfuxtdZE4rVSK2MkA4sCHD9iPGnAVxrBdLGCsM4vJ_RxR0dE4ALT6nbTYKzlJmn1FyzlE",
        dq:
          "mSy2E7MU7M7i5JaRamAlhDvFot74Wjuu8edss78BbVLeAFhe-Chzgsg3twTIbojwX0FmY7Ez2dcLIhoJ_N5nKf8cd9UXFYVDbR-W9wnmOi_18Q3w_-SGbhIciVkjYsyKs4vOZqdn801--s5o0qNBWgq_COhhIccTNYJ6j0rcPsE",
        qi:
          "bEyYSVysNUy9hAOu3UANQpyaRk9nhxEkE4ZmMqfEPQm7ooLtURGPPqTeWRMdox6UuHjuxfv2VhT9TzvLBnziQ5luIc4-9qXyDUrv6hqiXQJY4v7K2AJ9QkChT6WTexdpOS7PaT5LUEvUnvKY90-5pC-p9ccgLW6rxXu3_A-d9QU",
      },
    ],
  },
  responseTypes: ["none", "code", "id_token", "code token", "code id_token"], // `code token` enables implicit flow
  clients: [
    {
      client_id: "foo",
      client_secret: "bar",
      redirect_uris: [`https://${siteHostname}/cb`],
      response_types: ["code", "code id_token"],
      //grant_types: ["refresh_token", "authorization_code", "implicit"],
      grant_types: ["authorization_code", "refresh_token"],
    },
    {
      client_id: "pkce1",
      client_secret: "pkceSecret",
      redirect_uris: [`https://${siteHostname}/cb/pkce`],
      response_types: ["code"],
      grant_types: ["authorization_code"],
    },
    {
      client_id: "implicit",
      client_secret: "implicitSecret",
      redirect_uris: [`https://${siteHostname}/cb/implicit`],
      response_types: ["code token"],
      grant_types: ["authorization_code", "implicit"],
    },
  ],
};

const oidc = new Provider(`http://${providerHostname}/`, configuration);
oidc.proxy = true;
const oidcCallback = oidc.callback();

oidc.on("server_error", (ctx, err) => {
  dbg("%s %o", colors.red(err.message), err);
});

let demoLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  dbg(colors.black.bgGreen("REQUEST"), colors.cyan(req.url));
  //console.log("RESPONSE", res.statusCode, res.getHeaders());
  next();
};

app.use(demoLogger);

app.get(
  "/interaction/:uid",
  async (req: express.Request, res: express.Response) => {
    try {
      const details = await oidc.interactionDetails(req, res);
      dbgI("%O", details);
      return oidcCallback(req, res);
    } catch (err) {
      console.error(err);
    }
  }
);

app.use("/", oidcCallback);

app.listen(PORT, () => {
  console.log(
    `oidc-provider listening on port ${PORT}, check http://${providerHostname}:${PORT}/.well-known/openid-configuration`
  );
});
