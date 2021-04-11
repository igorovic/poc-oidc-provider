import { HttpProxyAgent } from "hpagent";

const burpProxy = new HttpProxyAgent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
  scheduling: "fifo",
  proxy: "http://127.0.0.1:37819", // <= burp suite proxy
});

export { burpProxy };
