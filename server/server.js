import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // your Vite dev server
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, system } = req.body;

    const response = await fetch("https://api.kilo.ai/api/gateway/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.KILO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "kilo-auto/free",
        max_tokens: 300,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Forward the SSE stream directly to the client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
