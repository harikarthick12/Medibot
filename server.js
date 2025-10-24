import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import knowledge from "./medical-knowledge.js";
import Fuse from "fuse.js";
import open from "open";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Build search array for Fuse.js fuzzy matching
const symptomsList = Object.entries(knowledge).map(([key, value]) => ({
  name: key,
  keywords: value.keywords,
  info: value,
}));

// Fuse.js options (lower threshold = stricter match)
const fuse = new Fuse(symptomsList, {
  keys: ["keywords"],
  threshold: 0.4,
  includeScore: true,
});

// Preprocess user input
function preprocessInput(input) {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

// Chat endpoint
app.post("/api/chat", (req, res) => {
  const rawMessage = req.body.message || "";
  const userMessage = rawMessage.toLowerCase();

  const words = userMessage.split(/\s+/);
  let response =
    "I'm not sure about those symptoms. Please describe more clearly or consult a healthcare professional.";

  for (const word of words) {
    const result = fuse.search(word);
    if (result.length > 0) {
      const info = result[0].item.info;

      response = `
🤒 Possible Conditions: ${info.conditions.join(", ")}
💊 Home Remedies: ${info.remedies.join(", ")}
💊 Recommended Tablets (Low Dosage): ${
        info.tablets ? info.tablets.join(", ") : "No specific tablet suggested"
      }
✅ Things to Do: ${info.dos.join(", ")}
❌ Things to Avoid: ${info.donts.join(", ")}
⚠️ Disclaimer: This information is for educational purposes only. Consult a doctor before taking any medication.
      `;
      break;
    }
  }

  res.json({ response });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 MediBot server running on port ${PORT}`);
  if (!process.env.PORT) open(`http://localhost:${PORT}`);
});
