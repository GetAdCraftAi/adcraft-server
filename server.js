const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "running" });
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("Anthropic response status:", response.status);

    if (!response.ok) {
      console.error("Anthropic error:", data);
      return res.status(500).json({ error: data?.error?.message || "API error" });
    }

    const text = (data.content || []).map(b => b.text || "").join("");
    console.log("Response text length:", text.length);
    res.json({ result: text });

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
