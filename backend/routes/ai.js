import express from 'express';
import { askGemini, generateMoodSuggestions } from '../services/gemini.js';
import { db } from '../config/db.js';

const router = express.Router();

// COASTAL TRAVEL CHATBOT
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // Pre-load detailed system context about Kerala coastal tourism to make Gemini sound highly educated
  const systemContext = `
    You are "Coastal AI", the official luxury travel chatbot for Coastal Tourism Kerala.
    Your personality is warm, enthusiastic, highly knowledgeable, and professional (Namaste!).
    You have deep expertise in Kerala's 5+ coastal districts, 100+ beaches, and culinary heritage.
    
    GUIDELINES:
    1. Focus answers strictly on beach recommendations, coastal activities, seafood delicacies, accommodations, and travel planning in Kerala.
    2. Suggest specific places from Alappuzha, Thiruvananthapuram (Varkala, Kovalam), Ernakulam (Kochi, Cherai), Kozhikode, Kannur, and Kasaragod.
    3. Suggest actual dishes like Karimeen Pollichathu, Malabar Prawn Curry, and local Toddy Shop specials.
    4. Provide formatting (bullet points, bold text) to keep answers visually pleasing.
    5. Always remind the user that they can book hotels and activities directly through our "Explore More" buttons and track them in their Dashboard!
  `;

  try {
    const reply = await askGemini(message, systemContext, history);
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Coastal AI is briefly resting. Please ask again.' });
  }
});

// MOOD-BASED AI TRIP SEARCH
router.post('/mood-search', async (req, res) => {
  const { mood } = req.body; // 'romantic', 'peaceful', 'adventure', 'budget'

  if (!mood) {
    return res.status(400).json({ error: 'Mood query is required' });
  }

  try {
    // 1. Get AI suggestions for this mood
    const aiTips = await generateMoodSuggestions(mood);

    // 2. Fetch matched beaches based on mood tags from our database
    const allBeaches = await db.getBeaches();
    const matchedBeaches = allBeaches.filter(b => b.mood === mood || b.activities.includes(mood));

    res.json({
      mood,
      aiTips,
      matchedBeaches: matchedBeaches.length > 0 ? matchedBeaches : allBeaches.slice(0, 2)
    });
  } catch (err) {
    console.error('Mood search error:', err);
    res.status(500).json({ error: 'AI failed to classify your mood' });
  }
});

export default router;
