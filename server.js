const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS: allow your Netlify domain + localhost for dev ──
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "https://bytron-globe.netlify.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
        cb(null, true);
      } else {
        cb(null, true); // allow all for now; tighten later if needed
      }
    },
  })
);

app.use(express.json());

// ── Allowed codes from env ──
const ALLOWED_CODES = JSON.parse(process.env.ALLOWED_CODES || "[]");

// ── Message lines per prefix ──
const MESSAGE_LINES = {
  sc_A: [
    "🍏 You're trying to Access Apple of Fortune Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
  sc_T: [
    "🎯 You're trying to Access Thimble Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
  sc_W: [
    "🕶 You're trying to Access Wild West Gold Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "antidetect.fun",
  ],
  "1_": [
    "🔐 You're trying to Access Aviator Predictor App",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "antidetect.fun",
  ],
  sc_M: [
    "🔐 You're trying to Access 1WinxMines Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
};

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ status: "BYTRON API online", timestamp: new Date().toISOString() });
});

// ── Validate code endpoint ──
app.post("/api/validate-code", (req, res) => {
  try {
    const code = (req.body?.code ?? "").toString().trim();

    if (!code) {
      return res.status(400).json({ ok: false, error: "No code provided" });
    }

    if (!ALLOWED_CODES.includes(code)) {
      return res.status(401).json({ ok: false, error: "Invalid or unauthorized code" });
    }

    // detect prefix
    let prefix = "";
    if (code.startsWith("sc_A")) prefix = "sc_A";
    else if (code.startsWith("sc_T")) prefix = "sc_T";
    else if (code.startsWith("sc_W")) prefix = "sc_W";
    else if (code.startsWith("sc_M")) prefix = "sc_M";
    else if (code.startsWith("1_")) prefix = "1_";
    else prefix = "unknown";

    const lines = MESSAGE_LINES[prefix] || ["✅ Access Granted — Default route active."];
    const message = lines.join("\n");

    return res.json({ ok: true, type: prefix, message });
  } catch (err) {
    console.error("validate-code error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`⬡ BYTRON API running on port ${PORT}`);
});
