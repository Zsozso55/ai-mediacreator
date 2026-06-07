// Install node-fetch if running locally, Vercel handles this in production
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;

    try {
        // Example using Google Gemini API
        // Ensure you add GEMINI_API_KEY to your Vercel Environment Variables
        const apiKey = process.env.GEMINI_API_KEY; 
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await aiResponse.json();
        const replyText = data.candidates[0].content.parts[0].text;

        res.status(200).json({ reply: replyText });
        
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ reply: "Connection error occurred." });
    }
}
