// api/login.js — checks the app password and, if correct, sets a secure
// httpOnly cookie. The browser can't read this cookie from JS, and it only
// travels over HTTPS, so it's a real gate (not a snoopable front-end check).
//
// Requires the APP_PASSWORD environment variable to be set in Vercel.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: "Server is missing APP_PASSWORD" });
    return;
  }

  const { password } = req.body || {};
  if (typeof password !== "string" || password !== expected) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  // 30-day httpOnly cookie. Value is the password, checked server-side by
  // api/rosie. HttpOnly = JS can't read it; Secure = HTTPS only.
  res.setHeader(
    "Set-Cookie",
    `wh_auth=${encodeURIComponent(expected)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
  );
  res.status(200).json({ ok: true });
}
