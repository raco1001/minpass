export const defaultRedactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['set-cookie']",
  "body.password",
  "body.token",
  "body.refreshToken",
  "query.token",
  "res.headers.set-cookie",
];
