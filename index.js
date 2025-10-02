import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { queryAgent } from "./agent.js";

config();

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  // Add your production frontend URLs here
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware to handle both JSON and form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/', async (req, res) => {
  try {
    const query = req.body.query;

    const result = await queryAgent(query.trim());

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 AI Agent API listening on port ${port}`);
});
