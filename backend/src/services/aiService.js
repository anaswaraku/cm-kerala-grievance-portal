"use strict";

const CATEGORIES = [
  "Roads & Public Infrastructure",
  "Water Supply",
  "Electricity",
  "Healthcare & Medical Services",
  "Education",
  "Sanitation & Waste Management",
  "Local Self Government",
  "Transportation",
  "Revenue & Land Services",
  "Public Distribution System (Ration)",
  "Police & Public Safety",
  "Social Welfare & Pensions",
  "Agriculture & Animal Husbandry",
  "Environment & Pollution",
  "Other Government Services",
];

/**
 * Analyze a grievance with Gemini and return structured suggestions.
 * Returns null if GEMINI_API_KEY is not set or on any error.
 */
const analyzeGrievance = async ({ subject, description, departments = [] }) => {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    const deptList = departments.length
      ? departments.join(", ")
      : "Public Works, Water Authority, KSEB, Health Department, Education Department";

    const prompt = `You are an AI assistant for the Kerala CM Grievance Portal.
Analyze the following citizen grievance and respond with ONLY valid JSON (no markdown, no explanation).

Subject: ${subject}
Description: ${description}

Available departments: ${deptList}
Available categories: ${CATEGORIES.join(", ")}

Respond with exactly this JSON structure:
{
  "summary": "<2-3 sentence plain-language summary of the grievance>",
  "suggested_department": "<one department name from the available departments list>",
  "suggested_category": "<one category from the available categories list>",
  "suggested_priority": "<Low | Medium | High>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    // Silently fail — AI is optional
    console.error("[aiService] analyzeGrievance error:", err.message);
    return null;
  }
};

module.exports = { analyzeGrievance };
