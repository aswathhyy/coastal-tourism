import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';

// Load environment variables from the backend root .env file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini client — correct import path
let geminiClient = null;
let SDK_READY = false;

try {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  if (apiKey && apiKey.length > 10) {
    geminiClient = new GoogleGenerativeAI(apiKey);
    SDK_READY = true;
    console.log('🤖 Gemini AI SDK initialized (gemini-2.5-flash) ✅');
  } else {
    console.log('⚠️ GEMINI_API_KEY not set — using local AI fallback responses');
  }
} catch (e) {
  console.log('⚠️ @google/generative-ai SDK failed to import:', e.message);
  console.log('   Run: npm install @google/generative-ai');
}

console.log('🔑 GEMINI_API_KEY loaded:', apiKey ? '✅ Found' : '❌ Not found');

// OFFLINE FALLBACK RESPONSES (used only when Gemini is unavailable)
const OFFLINE_RESPONSES = {
  welcome:
    "Namaste! 🌴 Welcome to Coastal Tourism Kerala's AI Travel Companion. I can help you find stunning beaches, plan itineraries, suggest seafood spots, or guide you through bookings. What is your dream coastal vacation?",
  default:
    "Kerala has amazing beaches like Varkala, Kovalam, Cherai, Marari, and Bekal. Would you like to know more about any of them?",
  romantic:
    "Varkala and Bekal are perfect romantic destinations with cliff views and sunset beaches. Varkala's cliffside restaurants offer spectacular Arabian Sea sunsets! 🌅",
  peaceful:
    "Marari Beach and Cherai Beach offer peaceful vibes, coconut groves, and quiet shorelines for total relaxation. 🌴",
  adventure:
    "Try surfing in Varkala, kayaking in Cherai Backwaters, and drive-in adventures at Muzhappilangad Drive-In Beach in Kannur! 🏄"
};

// Simple keyword-based fallback
function getOfflineResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return OFFLINE_RESPONSES.welcome;
  }
  if (msg.includes('romantic') || msg.includes('honeymoon') || msg.includes('couple')) {
    return OFFLINE_RESPONSES.romantic;
  }
  if (msg.includes('peaceful') || msg.includes('relax') || msg.includes('quiet')) {
    return OFFLINE_RESPONSES.peaceful;
  }
  if (msg.includes('adventure') || msg.includes('surf') || msg.includes('kayak') || msg.includes('thrill')) {
    return OFFLINE_RESPONSES.adventure;
  }
  return OFFLINE_RESPONSES.default;
}

// MAIN GEMINI FUNCTION — Uses gemini-2.5-flash only
export async function askGemini(prompt, systemContext = "", history = []) {
  const systemInstruction = systemContext || `
    You are "Coastal AI", the official luxury travel chatbot for Coastal Tourism Kerala.
    Your personality is warm, enthusiastic, highly knowledgeable, and professional.
    You have deep expertise in Kerala's coastal districts, beaches, and culinary heritage.
    Focus strictly on: beach recommendations, coastal activities, seafood, accommodations, and travel planning in Kerala.
    Suggest specific places from: Alappuzha, Thiruvananthapuram (Varkala, Kovalam), Ernakulam (Kochi, Cherai),
    Kozhikode, Kannur (Muzhappilangad), and Kasaragod (Bekal Fort).
    Mention actual dishes like Karimeen Pollichathu, Malabar Prawn Curry, Kerala Fish Curry.
    Use bullet points and formatting for clarity. Keep responses under 200 words and engaging.
    Always suggest users can book hotels and activities through "Explore More" buttons on the website.
  `;

  // ── Try Gemini 2.5 Flash API ──
  if (SDK_READY && geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction,
        generationConfig: { temperature: 0.6, topP: 0.9 }
      });

      // Build chat history — Gemini requires first message to be 'user'
      let normalizedHistory = (history || [])
        .filter(Boolean)
        .map((item) => ({
          role: (item.role === 'ai' || item.role === 'model') ? 'model' : 'user',
          parts: [{ text: typeof item.text === 'string' ? item.text : (item.message || '') }]
        }))
        .filter(item => item.parts[0].text.trim().length > 0);

      // Drop all leading 'model' messages — Gemini requires history to start with 'user'
      while (normalizedHistory.length > 0 && normalizedHistory[0].role === 'model') {
        normalizedHistory.shift();
      }


      let result;
      if (normalizedHistory.length > 0) {
        const chat = model.startChat({ history: normalizedHistory });
        result = await chat.sendMessage(prompt);
      } else {
        result = await model.generateContent(prompt);
      }

      // Extract text from response
      const text = result?.response?.text?.();
      if (text && text.trim().length > 0) {
        console.log('✅ Gemini 2.5 Flash response received');
        return text.trim();
      }

      // Try candidates fallback
      const candidateText = result?.response?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
      if (candidateText && candidateText.trim().length > 0) {
        console.log('✅ Gemini 2.5 Flash response (from candidates)');
        return candidateText.trim();
      }

      console.warn('⚠️ Gemini returned empty response, falling back to local DB');
    } catch (sdkErr) {
      const errMsg = sdkErr?.message || String(sdkErr);
      console.warn('⚠️ Gemini 2.5 Flash error:', errMsg.split('\n')[0]);
    }
  }

  // ── Local dynamic fallback using our content DB ──
  try {
    const lower = prompt.toLowerCase();
    const beaches = await db.getBeaches();
    const districts = await db.getDistricts();

    // Recommendations intent
    const wantRecommend = /recommend|suggest|where to stay|where to go|best beaches|places to visit|top beaches/.test(lower);
    if (wantRecommend) {
      const moodMatch = ['romantic', 'peaceful', 'adventure', 'budget'].find(m => lower.includes(m));
      let candidates = beaches.slice();
      if (moodMatch) {
        candidates = beaches.filter(b => b.mood === moodMatch || (b.activities || []).some(a => a.includes(moodMatch)));
      }
      if (!candidates || candidates.length === 0) candidates = beaches.slice(0, 3);
      const picks = candidates.slice(0, 3).map(b => `- **${b.name}** (${b.location}): ${b.shortDescription || b.tagline || 'Beautiful coastal spot.'}`);
      return `Here are some top recommendations for Kerala:\n\n${picks.join('\n')}\n\nClick 'Explore More' on any listing to book hotels or activities! 🌴`;
    }

    // District match
    for (const d of districts) {
      if (lower.includes(d.name.toLowerCase())) {
        return `**${d.name}**: ${d.description || OFFLINE_RESPONSES.default}`;
      }
    }

    // Beach match
    for (const b of beaches) {
      if (lower.includes(b.name.toLowerCase())) {
        return `**${b.name}** is located at ${b.location}. ${b.shortDescription || b.detailedDescription || ''} Rating: ⭐ ${b.rating}/5. Activities include: ${(b.activities || []).join(', ')}.`;
      }
    }

    return getOfflineResponse(prompt);
  } catch (err) {
    console.error('❌ askGemini local fallback failed:', err);
    return getOfflineResponse(prompt);
  }
}

// DISTRICT DESCRIPTION GENERATOR
export async function generateDistrictDesc(districtName) {
  const systemContext = `
    You are a premium Kerala tourism writer.
    Write a cinematic, visually rich 3-sentence travel description.
    Focus on the unique coastal character, must-see spots, and atmosphere.
  `;
  const prompt = `Write a premium tourism description for ${districtName} coastal district in Kerala, India. Make it evocative and inspiring for travelers.`;

  try {
    return await askGemini(prompt, systemContext);
  } catch (err) {
    console.error('District AI Error:', err);
    const localDistricts = await db.getDistricts();
    const found = localDistricts.find(d => d.name.toLowerCase().includes(districtName.toLowerCase()));
    return found ? found.description : `Explore the beautiful coastal shores of ${districtName} in Kerala.`;
  }
}

// MOOD-BASED TRAVEL SUGGESTIONS
export async function generateMoodSuggestions(mood) {
  const systemContext = `
    You are an expert Kerala coastal tourism AI.
    Give vivid, cinematic travel suggestions for a specific mood.
    Keep your response under 150 words. Use emojis.
    Focus on beaches, food, activities, and atmosphere specific to Kerala.
  `;
  const prompt = `Suggest the perfect Kerala coastal travel experience for someone in a "${mood}" mood. Include specific beach names, authentic food to try, activities, and the overall vibe.`;

  try {
    return await askGemini(prompt, systemContext);
  } catch (err) {
    console.error('Mood AI Error:', err);
    const fallbacks = {
      romantic: OFFLINE_RESPONSES.romantic,
      peaceful: OFFLINE_RESPONSES.peaceful,
      adventure: OFFLINE_RESPONSES.adventure,
    };
    return fallbacks[mood] || OFFLINE_RESPONSES.default;
  }
}