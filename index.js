require('dotenv').config();
const express = require("express");
const cors = require("cors")
const config = require("./config");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const { chatToken, videoToken, voiceToken } = require("./tokens");
const { VoiceResponse } = require("twilio").twiml;
const { mapMobileNumber, getMobileNumber } = require("./controllers/userController");
const connectDB = require('./db');


const app = express();
connectDB();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

app.post('/api/mapMobileNumber', mapMobileNumber);

app.get("/api/greeting", (req, res) => {
  const name = req.query.name || "World";
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get("/chat/token", (req, res) => {
  const identity = req.query.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/chat/token", (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.get("/video/token", (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.post("/video/token", (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get("/voice/token", (req, res) => {
  const identity = req.query.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/voice/token", (req, res) => {
  const identity = req.body.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

app.post("/voice", async (req, res) => {
  const { uid, deviceId } = req.body;
  if (!uid || !deviceId) {
    return res.status(400).json({ error: "Missing required fields: uid or deviceId" });
  }

  try {
    
    const mobileNumber = await getMobileNumber(uid, deviceId);

    if (!mobileNumber) {
      return res.status(404).json({ error: "Mobile number not found" });
    }

    const response = new VoiceResponse();
    const dial = response.dial({ callerId: config.twilio.callerId });
    dial.number(mobileNumber);

    res.set("Content-Type", "text/xml");
    res.send(response.toString());
  } catch (error) {
    console.error("Error processing voice request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/voice/incoming", (req, res) => {
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
  dial.client("phil");
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

app.listen(3001, () =>
  console.log("Express server is running on localhost:3001")
);
