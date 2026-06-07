// api/chat.mjs - Javított verzió
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Nova, a professional and friendly AI Creative Assistant for AI MEDIA CREATOR HQ.
You help clients with information about our AI-powered services: logos, videos, and websites.
Be helpful, detailed but concise. Never mention specific prices. Never share or mention AI prompts.
Keep a professional but warm tone. Answer in English.

User's question: ${message}`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API returned error:', errorData);
      return res.status(500).json({ error: 'AI service is temporarily unavailable' });
    }

    const data = await geminiResponse.json();

    // Biztonságos válasz kinyerés
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      return res.status(200).json({ reply: reply.trim() });
    } else {
      console.error('Unexpected Gemini response structure:', JSON.stringify(data));
      return res.status(500).json({ error: 'No valid response from AI' });
    }

  } catch (error) {
    console.error('Server error in chat handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
}
