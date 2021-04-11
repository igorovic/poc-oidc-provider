import jwksClient from "jwks-rsa";
import jsonwebtoken from "jsonwebtoken";

const kid = "1mYJ2DmNQL3lFSiHSAEeUgd2gdXapIQN3PmjDHcjjtE";
const token =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFtWUoyRG1OUUwzbEZTaUhTQUVlVWdkMmdkWGFwSVFOM1BtakRIY2pqdEUifQ.eyJzdWIiOiJqb2hueSIsImF0X2hhc2giOiJlLW1VMHlVbnZRdDVRNUxSRVlEckNRIiwiYXVkIjoiZm9vIiwiZXhwIjoxNjE4MTQ0Njk0LCJpYXQiOjE2MTgxNDEwOTQsImlzcyI6Imh0dHA6Ly9wcm92aWRlci5sb2NhbC8ifQ.d0IqPL_8s6qlUg7-30xBwvV9YjmEKgtLbpGsvMf1L992eEqOdjWZO1Hdiy16WpvvQTdvpMKyTV2_UKSBYkmYH8cA2Fgsbu3qJFVGQm7kx-aZSXCG1bT7FkwX77HAoGgQ1W7YIpYOIEEuzIIBI7jec4Qhqvv1ac_Quhf4e7jOKjoDVmk75u8PNgdQssSbLDNP-r3OrbKmF_hwd7IN5CEbjy9VzH5cRIyeu-O5HCwQLIFxfxgtfucUBUz8rN0YRNWcfxHlQoLiouOZtHpaGdKEoEvv7p6zly72vRP4rzRoc-u-3KL9-6SA_1DZ30bT3xIIDV0MSlutTltodxH1D1BsPw";

const client = jwksClient({
  jwksUri: "http://provider.local/jwks",
  requestHeaders: {}, // Optional
  timeout: 15000, // Defaults to 15s
});

try {
  client
    .getSigningKey(kid)
    .then((key) => {
      const signingKey = key.getPublicKey();
      console.log("signingKey %s", signingKey);
      jsonwebtoken.verify(token, signingKey, (err, decoded) => {
        console.log(decoded);
        if (err) {
          console.error(err);
        }
      });
    })
    .catch((err) => {
      console.error(err);
    });
} catch (err) {
  console.error(err);
}
