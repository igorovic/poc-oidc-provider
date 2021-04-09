#  oAuth and openId LAB

## Use caddy proxy on local machine

https://caddyserver.com/docs/

- Config file `Caddyfile` is already created
- simply run `caddy run` at the root of this repo where Caddyfile is

## Burp suite

- Burp suite is used to log all the requests.
- The site openid-client is configured to use burp suite proxy. `custom.setHttpOptionsDefaults`

# How to start

- start Burp Suite and it's proxy
- start provider `npm run provider`
- start site `npm run site`
- Use burp suite Chromium browser to navigate to `http://site.local/login`

You may need to configure your `/etc/hosts` to resolve

- `site.local`
- and `provider.local`
  to => `localhost`

**/etc/hosts**

```
127.0.0.1 site.local
127.0.0.1 provider.local
```
