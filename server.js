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

const symptomsList = [];
for (const key in knowledge) {
  symptomsList.push({ name: key, keywords: knowledge[key].keywords, info: knowledge[key] });
}

const fuse = new Fuse(symptomsList, { keys: ["keywords"], threshold: 0.4, includeScore: true });

function preprocessInput(input) {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

app.post("/api/chat", (req, res) => {
  const rawMessage = req.body.message || "";
  const userMessage = preprocessInput(rawMessage);
  const words = userMessage.split(/\s+/);

  let response = "I'm not sure about those symptoms. Please describe more clearly or consult a healthcare professional.";
  
  for (const word of words) {
    const result = fuse.search(word);
    if (result.length > 0) {
      const info = result[0].item.info;
      response = `
🤒 Possible Conditions: ${info.conditions.join(", ")}
💊 Home Remedies: ${info.remedies.join(", ")}
💊 Recommended Tablets: ${info.tablets.join(", ")}
✅ Things to Do: ${info.dos.join(", ")}
❌ Things to Avoid: ${info.donts.join(", ")}
⚠️ Disclaimer: This information is for educational purposes only. Consult a doctor before taking any medication.
      `;
      break;
    }
  }

  res.json({ response });
});

app.listen(PORT, () => {
  console.log(`MediBot server running on port ${PORT}`);
  if (!process.env.PORT) open(`http://localhost:${PORT}`);
});
