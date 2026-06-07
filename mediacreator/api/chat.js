export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    // Ellenőrizzük, hogy a Vercel egyáltalán látja-e a kulcsot
    if (!apiKey) {
        console.error("Hiba: Nincs beállítva a GEMINI_API_KEY a Vercel Environment Variables között!");
        return res.status(500).json({ reply: "Szerver beállítási hiba: Hiányzik az API kulcs." });
    }

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await aiResponse.json();
        
        // Hibakeresés: Írjuk ki a Vercel logba a nyers választ a Google-től
        console.log("Google API nyers válasz:", JSON.stringify(data));

        // Ha a Google hibaüzenetet küldött (pl. rossz a kulcs)
        if (data.error) {
            console.error("Google API hiba:", data.error.message);
            return res.status(500).json({ reply: "Hiba történt az AI szolgáltatásban. (Nézd meg a Vercel logot)" });
        }

        // Ha nincs hiba, de valamiért mégis üres a válasz
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({ reply: "Az AI nem küldött értékelhető választ." });
        }

        // Ha minden tökéletes, kiolvassuk és visszaküldjük a szöveget
        const replyText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: replyText });
        
    } catch (error) {
        console.error("Hálózati hiba a szerveroldalon:", error);
        res.status(500).json({ reply: "Hálózati hiba történt a szerveren." });
    }
}
