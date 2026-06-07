export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        console.error("Hiba: Nincs GEMINI_API_KEY beállítva a Vercelen!");
        return res.status(500).json({ reply: "Szerver beállítási hiba: Hiányzik az API kulcs." });
    }

    try {
        // 1. LÉPÉS: Lekérdezzük az éppen most elérhető modellek listáját
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();

        if (modelsData.error) {
            console.error("Modell lekérdezési hiba:", modelsData.error);
            return res.status(500).json({ reply: "Hiba az AI szerverrel való kapcsolatban." });
        }

        // 2. LÉPÉS: Keresünk egy olyan modellt, ami biztosan támogatja a chat/szöveggenerálást
        const validModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent")
        );

        if (validModels.length === 0) {
            console.error("Nincs elérhető generatív modell a fiókban.");
            return res.status(500).json({ reply: "Jelenleg nincs elérhető AI modell." });
        }

        // Preferáljuk a gyors 'flash' vagy okos 'pro' modelleket, ha van, különben az elsőt használjuk
        const selectedModel = validModels.find(m => m.name.includes("flash")) 
                           || validModels.find(m => m.name.includes("pro")) 
                           || validModels[0];

        // Ezt kiírjuk a Vercel logba, így látni fogod, pontosan melyik modellt találta meg a kód
        console.log("Automatikusan kiválasztott modell:", selectedModel.name);

        // 3. LÉPÉS: Elküldjük az üzenetet a dinamikusan kiválasztott, garantáltan létező modellnek
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent?key=${apiKey}`;

        const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.
