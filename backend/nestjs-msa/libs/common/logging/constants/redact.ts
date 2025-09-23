export const redaction = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    "body.password",
    "body.token",
    "query.token",
    "res.headers.set-cookie",
  ],
  censor: "***",
};
