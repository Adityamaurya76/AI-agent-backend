import { config } from "dotenv";
config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI } from "@langchain/community/tools/serpapi";

// ✅ Use correct model name (no "models/")
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

const searchTool = new SerpAPI(process.env.SERP_API_KEY, {
  location: "India",
});

let agent = null;

const initializeAgent = async () => {
  if (!agent) {
    agent = await initializeAgentExecutorWithOptions(
      [searchTool],
      model,
      {
        agentType: "zero-shot-react-description",
        agentArgs: {
          prefix: `You are an AI assistant. 
          If the user asks about the latest news, live events, or current data,
          ALWAYS use the SerpAPI tool to fetch up-to-date information.
          Otherwise, answer directly using your own knowledge.

          IMPORTANT RULES:
          - Always follow the Thought/Action/Observation/Final Answer format.
          - Do NOT add extra explanations outside this format.
          - End with "Final Answer: ..." only.`,
        },
      }
    );
  }
  return agent;
};

export const queryAgent = async (input) => {
  const agentInstance = await initializeAgent();
  try {
    const result = await agentInstance.invoke({ input });
    return result?.output || result;
  } catch (err) {
    console.error("Agent parsing failed. Raw error:", err);
    return "Sorry, I couldn't parse the response properly.";
  }
};
