require("dotenv").config();

const { InstallProvider, FileInstallationStore, LogLevel } = require("@slack/oauth");
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");

const scopes = [
  "app_mentions:read",
  "channels:read",
  "groups:read",
  "channels:manage",
  "chat:write",
  "incoming-webhook",
];
const userScopes = ["chat:write"];

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  authVersion: "v2",
  stateSecret: "my-state-secret",
  scopes,
  userScopes,
  installationStore: new FileInstallationStore(),
  logLevel: LogLevel.DEBUG,
});

const credentials = {
  key: fs.readFileSync("./cert.key"),
  cert: fs.readFileSync("./cert.crt"),
};

app.get("/", (req, res) => {
  res.send("Successfully setup and running Node and Express.");
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => console.log("Your Slack-OAuth app is listening on port 3000."));
httpsServer.listen(3443, () => console.log("Your Slack-OAuth app is listening on port 3443."));

const { WebClient } = require("@slack/web-api");
const client = new WebClient();

app.get("/slack/install", async (req, res, next) => {
  await installer.handleInstallPath(
    req,
    res,
    {},
    {
      scopes,
      userScopes,
      metadata: "some_metadata",
    }
  );
});

app.get("/slack/oauth_redirect", async (req, res) => {
  await installer.handleCallback(req, res);
});
