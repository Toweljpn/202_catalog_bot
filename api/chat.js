module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, contexts } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
  }

  const contextText = (contexts || [])
    .map((c, i) => `(${i + 1}) ${c.title}\n${c.body}`)
    .join("\n\n");

  const prompt = `
あなたは日本の節句人形の販売スタッフです。
以下の商品説明文を参考にして、質問に答えてください。

【商品説明文】
${contextText || "該当データなし"}

【質問】
${query}

- 正確に
- 誇張せず
- 情報がなければ「記載なし」と回答
`.trim();

  try {
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
      }),
    });

    const data = await resp.json();

    const answer =
      data.output_text ||
      data.choices?.[0]?.message?.content ||
      "すみません、回答を生成できませんでした。";

    res.status(200).json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "OpenAI request failed" });
  }
};
