export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { query, contexts } = await req.json();

  const prompt = `
あなたは日本の節句人形に詳しい販売員です。
次の製品説明文を参考にしながら、質問に答えてください。

【検索結果】
${contexts.map((c, i) => `(${i+1}) ${c.title}\n${c.body}`).join("\n\n")}

【質問】
${query}

顧客に安心感を与え、正確に、簡潔に答えてください。
  `;

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: prompt,
    }),
  });

  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
