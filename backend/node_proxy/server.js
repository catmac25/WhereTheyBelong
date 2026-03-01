// index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const cors = require('cors');
const multer = require("multer");
const upload = multer(); 
const FormData = require('form-data');
require('dotenv').config();
console.log("NODE: .env loaded JWT_SECRET =", process.env.JWT_SECRET);
const jwt = require("jsonwebtoken")
const passport = require("passport")
const session = require("express-session")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const {Server} = require("socket.io");
const http = require("http");
const { extractFields } = require("./extractFields");
// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({ secret: 'sessionrv', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
const server = http.createServer(app);
function issueJWT(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
// google auth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, 
(accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    emails: profile.emails,
  };
  return done(null, user);
}
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

let onlineUsers = {}; 
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (email) => {
    onlineUsers[email] = socket.id;
    console.log(`Registered ${email} → ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const email in onlineUsers) {
      if (onlineUsers[email] === socket.id) {
        delete onlineUsers[email];
      }
    }
  });
});
app.post("/send-notification", (req, res) => {
  const { email, title, message } = req.body;

  const socketId = onlineUsers[email];
  
  if (socketId) {
    io.to(socketId).emit("notification", {
      title,
      message,
      email,
      timestamp: new Date()
    });
  }

  res.json({ status: "sent" });
});
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const googleUser = {
        google_id: req.user.id,
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value,
      };
      const response = await axios.post(`${FASTAPI_URL}/api/users/google-login`, googleUser);
      const savedUser = response.data;
      const token = issueJWT({
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name
      });
      res.redirect(`http://localhost:5173/login?token=${token}`);
    } catch (error) {
      console.error("Google callback error:", error.message);
      res.redirect('/login?error=oauth_failed');
    }
  }
);
app.post('/api/register',upload.single('image'), async (req, res) => {
  try {
    const formData = new FormData();
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }
    if (req.file) {
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
    }
    const resp = await axios.post(`${FASTAPI_URL}/register`, formData, {
      headers: {
        Authorization: req.headers.authorization,
        ...formData.getHeaders()
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error("Register error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// Register case without image (descriptive attributes only)
app.post('/api/register-no-image', upload.none(), async (req, res) => {
  try {
    const formData = new FormData();
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    const resp = await axios.post(`${FASTAPI_URL}/register-no-image`, formData, {
      headers: {
        Authorization: req.headers.authorization,
        ...formData.getHeaders(),
      },
    });

    res.json(resp.data);
  } catch (err) {
    console.error("Register (no-image) error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

app.get('/api/registered', async (req, res) => {
  try {
    const resp = await axios.get(`${FASTAPI_URL}/registered`, { params: req.query });
    res.json(resp.data);
  } catch (err) {
    console.error("Fetch registered error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.get('/api/publiccases', async (req,res) => {
  try{
    const respo = await axios.get(`${FASTAPI_URL}/publiccases`);
    res.json(respo.data);
  }catch(err){
    console.error("Fetch public error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
})
app.get('/api/cases', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const resp = await axios.get(`${FASTAPI_URL}/registered-cases/${decoded.email}`);
    res.json(resp.data);
  } catch (err) {
    console.error("Fetch registered error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.get('/api/public/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const resp = await axios.get(`${FASTAPI_URL}/public/${id}`);
    res.json(resp.data);
  } catch (err) {
    console.error("Fetch public error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.post('/api/public', async (req, res) => {
  try {
    const resp = await axios.post(`${FASTAPI_URL}/public`, req.body);
    res.json(resp.data);
  } catch (err) {
    console.error("New public case error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.get(`/api/cases/:id`, async(req,res) => {
  try{
    const resp = await axios.get(`${FASTAPI_URL}/registered/${req.params.id}`);
    res.json(resp.data);
  }catch(err){
    console.error("error loading details:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
})
app.post(`/api/match`, async (req, res) => {
  try {
    const payload = {
      registeredId: req.body.registeredId
    };
    const resp = await axios.post(`${FASTAPI_URL}/match`, payload);
    res.json(resp.data);
  } catch (err) {
    console.error("Match error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.post('/api/matcha', async(req,res)=>{
  try{
    const resp = await axios.post(`${FASTAPI_URL}/matcha`);
    res.json(resp.data);
  }catch(err){
    console.error("Match error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
})
app.get('/api/user-by-email', async(req,res)=>{
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ detail: 'Email is required' });
    }

    const fastapiRes = await fetch(`${FASTAPI_URL}/user-by-email?email=${encodeURIComponent(email)}`
    );

    const data = await fastapiRes.json().catch(() => ({}));
    console.log(data)
    // Pass through status code and body
    return res.status(fastapiRes.status).json(data);
  } catch (err) {
    console.error('Error in /api/user-by-email proxy:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
})

app.get("/api/registercount", async(req,res) => {
  try{
    const {submitted_by, status} = req.query;
    const resp = await fetch(`${FASTAPI_URL}/registercount?submitted_by=${encodeURIComponent(submitted_by)}&status=NF`);
    const data = await resp.json().catch(() => ({}));
    return res.status(resp.status).json(data);
  }catch(err){
    console.error('Error in /api/register-count proxy:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
})
app.get("/api/images/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${FASTAPI_URL}/images/${id}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Image not found" });
    }
    const data = await response.json();
    res.json(data); 
    console.log(data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch image path" });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Node proxy server + Socket.io running on http://localhost:${PORT} → forwarding to ${FASTAPI_URL}`);

// const text = "a boy wearing blue jacket seen near metro";

// console.log(extractFields(text));
});
