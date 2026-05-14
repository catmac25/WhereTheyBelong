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
const PDFDocument = require("pdfkit");
const sgMail = require("@sendgrid/mail");
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
//har  jagah, har api mei use karna hai  
app.use(bodyParser.json());
// app.use(isIdPresent());
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

// Configure SendGrid (used for public case + registered case email alerts)
const SENDGRID_API_KEY = (process.env.SENDGRID_API_KEY || "").trim();
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.log(
    "SendGrid not configured in node_proxy. " +
      "Set SENDGRID_API_KEY in backend/node_proxy/.env to enable emails."
  );
}
const ALERT_RECIPIENTS = (process.env.ALERT_RECIPIENTS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const ALERT_FROM_EMAIL = (process.env.ALERT_FROM_EMAIL || "no-reply@example.com").trim();

function logSendgridError(prefix, err) {
  const status = err?.code || err?.response?.statusCode || err?.response?.status;
  const errors = err?.response?.body?.errors;
  if (Array.isArray(errors) && errors.length) {
    console.error(prefix, status, errors);
  } else {
    console.error(prefix, status || "-", err?.message || err);
  }
}

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// let onlineUsers = {}; 
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("register", (email) => {
//     onlineUsers[email] = socket.id;
//     console.log(`Registered ${email} → ${socket.id}`);
//   });

//   socket.on("disconnect", () => {
//     for (const email in onlineUsers) {
//       if (onlineUsers[email] === socket.id) {
//         delete onlineUsers[email];
//       }
//     }
//   });
// });
// app.post("/send-notification", (req, res) => {
//   const { email, title, message } = req.body;

//   const socketId = onlineUsers[email];
  
//   if (socketId) {
//     io.to(socketId).emit("notification", {
//       title,
//       message,
//       email,
//       timestamp: new Date()
//     });
//   }

//   res.json({ status: "sent" });
// });



async function buildRegisteredCasePdf(payload, caseId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text("New Registered Missing Person Case", { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Case ID: ${caseId}`);
      doc.text(`Name: ${payload.name || "-"}`);
      doc.text(`Father's Name: ${payload.fathers_name || "-"}`);
      doc.text(`Age: ${payload.age || "-"}`);
      doc.text(`Mobile: ${payload.mobile_number || "-"}`);
      doc.text(`Address: ${payload.address || "-"}`);
      doc.text(`Adhaar Card: ${payload.adhaar_card || "-"}`);
      doc.text(`Birth Marks: ${payload.birthmarks || "-"}`);
      doc.text(`Last Seen: ${payload.last_seen || "-"}`);
      doc.text(`Height: ${payload.height || "-"}`);
      doc.text(`Weight: ${payload.weight || "-"}`);
      doc.text(`Built: ${payload.built || "-"}`);
      doc.text(`District: ${payload.district || "-"}`);
      doc.text(`State: ${payload.state || "-"}`);
      doc.text(`Complainant Name: ${payload.complainant_name || "-"}`);
      doc.text(`Complainant Contact: ${payload.complainant_phone || payload.mobile_number || "-"}`);
      doc.text(`Submitted at (UTC): ${new Date().toISOString()}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function sendRegisteredCaseEmail(caseId, payload) {
  if (!SENDGRID_API_KEY || !ALERT_RECIPIENTS.length) {
    console.log(
      "SendGrid not configured in node_proxy. " +
      "Set SENDGRID_API_KEY and ALERT_RECIPIENTS in backend/node_proxy/.env to enable registered case emails."
    );
    return;
  }

  try {
    const pdfBuffer = await buildRegisteredCasePdf(payload, caseId);

    const msg = {
      to: ALERT_RECIPIENTS,
      from: ALERT_FROM_EMAIL,
      subject: `New registered missing persons case: ${payload.name || caseId}`,
      html: `
        <p>A new registered missing person case has been created.</p>
        <ul>
          <li><strong>Case ID</strong>: ${caseId}</li>
          <li><strong>Name</strong>: ${payload.name || "-"}</li>
          <li><strong>Age</strong>: ${payload.age || "-"}</li>
          <li><strong>Complainant</strong>: ${payload.complainant_name || "-"}</li>
          <li><strong>Complainant Contact</strong>: ${payload.complainant_phone || payload.mobile_number || "-"}</li>
        </ul>
        <p>See attached PDF for the full details.</p>
      `,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `registered_case_${caseId}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    console.log("SendGrid: notification email sent for registered case", caseId);
  } catch (err) {
    logSendgridError(`SendGrid: failed to send email for registered case ${caseId}`, err);
  }
}

/** Send the same registration email to the user who registered, as proof of registration. */
async function sendRegistrationProofToUser(caseId, payload, userEmail) {
  if (!SENDGRID_API_KEY || !userEmail) return;

  try {
    const pdfBuffer = await buildRegisteredCasePdf(payload, caseId);
    const msg = {
      to: userEmail,
      from: ALERT_FROM_EMAIL,
      subject: `Proof of Registration – Missing Person Case: ${payload.name || caseId}`,
      html: `
        <p>This email confirms that your missing person case has been successfully registered.</p>
        <ul>
          <li><strong>Case ID</strong>: ${caseId}</li>
          <li><strong>Name</strong>: ${payload.name || "-"}</li>
          <li><strong>Age</strong>: ${payload.age || "-"}</li>
          <li><strong>Complainant</strong>: ${payload.complainant_name || "-"}</li>
          <li><strong>Complainant Contact</strong>: ${payload.complainant_phone || payload.mobile_number || "-"}</li>
        </ul>
        <p>Please keep this email as proof of registration. See attached PDF for the full details.</p>
      `,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `registered_case_${caseId}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };
    await sgMail.send(msg);
    console.log("SendGrid: proof-of-registration email sent to user", userEmail);
  } catch (err) {
    logSendgridError(`SendGrid: failed to send proof email to user ${userEmail}`, err);
  }
}

/** Send congratulations email when a registered case matches a public sighting. */
async function sendMatchFoundEmail(caseId, caseName, userEmail) {
  if (!SENDGRID_API_KEY || !userEmail) return;

  try {
    const msg = {
      to: userEmail,
      from: ALERT_FROM_EMAIL,
      subject: `Congratulations – Match Found for Missing Person Case: ${caseName || caseId}`,
      html: `
        <p><strong>Congratulations!</strong></p>
        <p>We have great news: your registered missing person case has been matched with a public sighting.</p>
        <ul>
          <li><strong>Case ID</strong>: ${caseId}</li>
          <li><strong>Missing Person</strong>: ${caseName || "-"}</li>
        </ul>
        <p>Please log in to the system to view the match details and take the next steps.</p>
        <p>We hope this brings closure to you and your family.</p>
      `,
    };
    await sgMail.send(msg);
    console.log("SendGrid: match-found congratulations email sent to", userEmail);
  } catch (err) {
    logSendgridError(`SendGrid: failed to send match-found email to ${userEmail}`, err);
  }
}
//health check
app.get('/', (req,res)=> {
  res.send("Node Proxy Server Running");
})
// Test-only endpoint: send a registered-case email without touching the Python/DB layer.
app.post("/api/test-registered-email", async (req, res) => {
  const caseId = req.body.case_id || "TEST-REGISTERED-CASE";
  try {
    await sendRegisteredCaseEmail(caseId, {
      name: req.body.name,
      fathers_name: req.body.fathers_name,
      age: req.body.age,
      mobile_number: req.body.mobile_number,
      address: req.body.address,
      adhaar_card: req.body.adhaar_card,
      birthmarks: req.body.birthmarks,
      last_seen: req.body.last_seen,
      height: req.body.height,
      weight: req.body.weight,
      built: req.body.built,
      district: req.body.district,
      state: req.body.state,
      complainant_name: req.body.complainant_name,
      complainant_phone: req.body.complainant_phone,
    });
    res.json({ status: "email_sent", case_id: caseId });
  } catch (err) {
    console.error("Error in /api/test-registered-email:", err.message);
    res.status(500).json({ error: err.message });
  }
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
      res.redirect(`https://wheretheybelong.vercel.app/login?token=${token}`);
    } catch (error) {
      console.error("Google callback error:", error.message);
      res.redirect('/login?error=oauth_failed');
    }
  }
);
// AI vs Human image detection (used before case registration)
app.post('/api/check-ai-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
    });
    const resp = await axios.post(`${FASTAPI_URL}/check-ai-image`, formData, {
      headers: formData.getHeaders(),
    });
    res.json(resp.data);
  } catch (err) {
    console.error("Check AI image error:", err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.detail || err?.message || "AI detection failed",
    });
  }
});

app.post('/api/register', upload.single('image'), async (req, res) => {
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
    const caseId = resp.data?.case_id || resp.data?.id;

    if (caseId) {
      const payload = {
        name: req.body.name,
        fathers_name: req.body.fathers_name,
        age: req.body.age,
        mobile_number: req.body.mobile_number,
        address: req.body.address,
        adhaar_card: req.body.adhaar_card,
        birthmarks: req.body.birthmarks,
        last_seen: req.body.last_seen,
        height: req.body.height,
        weight: req.body.weight,
        built: req.body.built,
        district: req.body.district,
        state: req.body.state,
        complainant_name: req.body.complainant_name,
        complainant_phone: req.body.complainant_phone,
      };
      let userEmail = null;
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userEmail = decoded.email;
        }
      } catch (_) {}
      (async () => {
        try {
          await sendRegisteredCaseEmail(caseId, payload);
          if (userEmail) await sendRegistrationProofToUser(caseId, payload, userEmail);
        } catch (err) {
          console.error("Error while sending registered case email from node_proxy:", err.message);
        }
      })();
    }

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

    const caseId = resp.data?.case_id;
    if (caseId) {
      const payload = {
        name: req.body.name,
        fathers_name: req.body.fathers_name,
        age: req.body.age,
        gender: req.body.gender,
        mobile_number: req.body.mobile_number,
        address: req.body.address,
        adhaar_card: req.body.adhaar_card,
        birthmarks: req.body.birthmarks,
        last_seen: req.body.last_seen,
        height: req.body.height,
        weight: req.body.weight,
        built: req.body.built,
        district: req.body.district,
        state: req.body.state,
        complainant_name: req.body.complainant_name,
        complainant_phone: req.body.complainant_phone,
      };
      let userEmail = null;
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userEmail = decoded.email;
        }
      } catch (_) {}
      (async () => {
        try {
          await sendRegisteredCaseEmail(caseId, payload);
          if (userEmail) await sendRegistrationProofToUser(caseId, payload, userEmail);
        } catch (err) {
          console.error("Error sending register-no-image email:", err.message);
        }
      })();
    }

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
});

app.post('/api/publicsubmission', upload.single('image'), async (req, res) => {
  try {
    const formData = new FormData();

    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    if (req.file) {
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    }

    const resp = await axios.post(`${FASTAPI_URL}/publicsubmission`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // ❌ Email sending removed

    res.json(resp.data);

  } catch (err) {
    console.error("Public submission error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

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
app.get(`/api/cases/:id`, async (req, res) => {
  try {
    const resp = await axios.get(`${FASTAPI_URL}/case/${req.params.id}`);
    res.json(resp.data);
  } catch (err) {
    console.error("error loading details:", err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: err?.response?.data || err.message });
  }
});

// Unified case detail (registered or private)
app.get(`/api/case/:id`, async (req, res) => {
  try {
    const resp = await axios.get(`${FASTAPI_URL}/case/${req.params.id}`);
    res.json(resp.data);
  } catch (err) {
    console.error("error loading case detail:", err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: err?.response?.data || err.message });
  }
});
app.get('/api/match-private/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const resp = await axios.get(`${FASTAPI_URL}/api/match-private/${id}`);
    res.json(resp.data);
  } catch (err) {
    console.error("Fetch match-private error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

app.post(`/api/match`, async (req, res) => {
  try {
    const payload = {
      registeredId: req.body.registeredId
    };
    const resp = await axios.post(`${FASTAPI_URL}/match`, payload);
    const data = resp.data;

    if (data?.matched && data?.registeredId) {
      (async () => {
        try {
          const caseResp = await axios.get(`${FASTAPI_URL}/registered/${data.registeredId}`);
          const submittedBy = caseResp.data?.submitted_by;
          if (submittedBy) {
            await sendMatchFoundEmail(data.registeredId, caseResp.data?.name, submittedBy);
          }
        } catch (err) {
          console.error("Error sending match-found email:", err.message);
        }
      })();
    }

    res.json(data);
  } catch (err) {
    console.error("Match error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
app.post('/api/matcha', async (req, res) => {
  try {
    const resp = await axios.post(`${FASTAPI_URL}/matcha`);
    const data = resp.data;

    if (data?.matched && data?.matches?.length) {
      (async () => {
        for (const m of data.matches) {
          const regId = m.registeredId;
          if (!regId) continue;
          try {
            const caseResp = await axios.get(`${FASTAPI_URL}/registered/${regId}`);
            const submittedBy = caseResp.data?.submitted_by;
            if (submittedBy) {
              await sendMatchFoundEmail(regId, caseResp.data?.name, submittedBy);
            }
          } catch (err) {
            console.error("Error sending match-found email for", regId, err.message);
          }
        }
      })();
    }

    res.json(data);
  } catch (err) {
    console.error("Match error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});
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
    const resp = await fetch(
      `${FASTAPI_URL}/registercount?submitted_by=${encodeURIComponent(submitted_by)}&status=${encodeURIComponent(status || "NF")}`
    );
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
  console.log(`Node proxy server +  forwarding to ${FASTAPI_URL}`);

// const text = "a boy wearing blue jacket seen near metro";

// console.log(extractFields(text));
});
