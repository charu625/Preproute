# Troubleshooting API / Login Issues

## CORS error in the browser

**Symptom:** Console mentions `Access-Control-Allow-Origin` when calling `railway.app` directly.

**Fix:** Use the dev proxy — `VITE_API_BASE_URL` must be `/api` (default). Restart `npm run dev`. Login requests should go to `http://localhost:5173/api/...`, not to Railway.

## `ENOTFOUND` or `http proxy error` in the terminal

**Symptom:**
```
Error: getaddrinfo ENOTFOUND admin-moderator-backend-staging.up.railway.app
```

**Meaning:** Node (Vite proxy) cannot resolve the API hostname. This is a **DNS/network** issue on your machine, not wrong login credentials.

**Steps:**

1. Verify DNS:
   ```powershell
   nslookup admin-moderator-backend-staging.up.railway.app
   ```
2. Open in browser: https://admin-moderator-backend-staging.up.railway.app/api  
   (404 is OK — it proves the host is reachable.)
3. Disable VPN or try mobile hotspot if on corporate Wi‑Fi.
4. Restart dev server after any `.env` or `vite.config.ts` change:
   ```bash
   npm run dev
   ```
5. This project sets `dns.setDefaultResultOrder('ipv4first')` in `vite.config.ts` to avoid broken IPv6 routes on some networks.

## 502 Bad Gateway on login

**Meaning:** Proxy is running but could not forward to Railway (DNS down, API offline, or firewall).

Follow the same DNS/network steps as above.

## Test credentials

- User ID: `vedant-admin`
- Password: `vedant123`

## API base URL (from task)

`https://admin-moderator-backend-staging.up.railway.app/api`

Do not set the full URL in `.env` for local dev unless the backend enables CORS for `localhost` (it does not by default).
