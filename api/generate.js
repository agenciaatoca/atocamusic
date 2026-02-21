export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // 1. Captura as peças que vieram do seu HTML
    const { barName, extra, style } = req.body;

    // 2. Monta o "prompt" unindo essas peças
    const meuPrompt = `
Atue como Diretor de Copywriting da Atoca Music Brasília, especialista em marketing de experiência e indústria fonográfica.
Objetivo: Criar um convite magnético e de alta conversão para redes sociais (Instagram/WhatsApp).
Contexto: > - Local: ${barName}
Estilo Musical/Vibe: ${style}
Diferenciais da Noite: ${extra}
Diretrizes Criativas:
Tom de Voz: Sofisticado, energético e exclusivo. Não venda apenas um evento, venda o "lugar onde as coisas acontecem".
O Gancho: Deve interromper o scroll. Use uma pergunta provocativa ou uma afirmação audaciosa sobre a noite.
Imersão Sonora: Descreva a sensação da música e do ambiente (ex: o grave no peito, a harmonia das luzes, a energia do palco).
Escassez e Urgência: Insira um gatilho de que a noite é única e as vagas/mesas são limitadas.
Estrutura Obrigatória:
Headline (Gancho): Curto e impactante.
Corpo (A Experiência): 2 parágrafos curtos conectando o ${style} ao ambiente do ${barName}.
Bullets de Destaque: Liste os ${extra} de forma irresistível, não esqueça do horário
CTA (Chamada para Ação): Direta, clara e com senso de urgência.
Formatação: Use emojis de forma estratégica (não exagerada) e quebras de linha para facilitar a leitura no celular.
IMPORTANTE: Retorne APENAS o convite final.
Não inclua explicações, análises ou comentários.
Não explique a estrutura.
Não direcione o convite como se fosse da Atoca, use o ${barName}.
Entregue somente o texto pronto para copiar e colar.
`;
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    contents: [{
                    parts: [{ text: meuPrompt }]
                }]
            })
        });
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // 🔥 EXTRAÇÃO DIRETA DO TEXTO AQUI NO BACKEND
        const textoGerado =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoGerado) {
            return res.status(500).json({
            error: "A IA não retornou texto válido",
            raw: data
        });
    }

return res.status(200).json({
    text: textoGerado
});
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao processar a IA',
            details: error.message
        });
    }
}
