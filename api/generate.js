const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não configurada");
    }

    const { prompt, systemInstruction } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const finalPrompt = `
${systemInstruction || ""}

${prompt}
`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("ERRO COMPLETO:", error);
    return res.status(500).json({ error: error.message });
  }
};
