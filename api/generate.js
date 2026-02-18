export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { barName, extra, style } = req.body;

    if (!barName) {
        return res.status(400).json({ error: "Nome do bar obrigatório" });
    }

    const prompt = `
Você é diretor de copywriting da Atoca Music Brasília.
Crie convite magnético para Instagram e WhatsApp.

Bar: ${barName}
Estilo: ${style}
Extras: ${extra}

Estrutura:
- Gancho forte
- Experiência sonora
- Oferta
- CTA poderoso
`;

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ text });

    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar texto" });
    }
}
