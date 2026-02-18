module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key não configurada" });
    }

    const { prompt, systemInstruction } = req.body;

    const finalPrompt = `
${systemInstruction || ""}

${prompt}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sem resposta da IA.";

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
