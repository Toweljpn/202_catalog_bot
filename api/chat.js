module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, contexts } = req.body || {};
  if (!query) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    return;
  }

  const contextText = (contexts || [])
    .map(
      (c, i) => `(${i + 1}) ${c.title || ""}\n${c.body || c.description || ""}`
    )
    .join("\n\n");

  const prompt = `
あなたは日本の節句人形やインテリア商品に詳しい販売スタッフです。
次の製品説明文を参考にしながら、ユーザーの質問に答えてください。

【参考となる説明文】
${contextText || "（該当データなし）"}

【ユーザーの質問】
${query}

条件:
- わかりやすく、専門用語は簡単に補足する
- 誇張はせず、説明文に書かれていないことは推測で断定しない
- 必要なら「この情報からはわかりません」と正直に伝える
  `.trim();

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();
    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "すみません、うまく回答を生成できませんでした。";

    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to call OpenAI API" });
  }
};
