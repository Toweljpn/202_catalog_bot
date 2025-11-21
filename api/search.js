const fs = require("fs");
const path = require("path");

// リクエストボディ(JSON)をパース
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = {};
  try {
    body = await parseJsonBody(req);
  } catch (e) {
    console.error("parse error:", e);
    res.status(400).json({ error: "invalid json" });
    return;
  }

  const { query } = body || {};
  if (!query || !query.trim()) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  try {
    // public/data.jsonl を読む
    const filePath = path.join(process.cwd(), "public", "data.jsonl");
    const raw = fs.readFileSync(filePath, "utf8");

    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const results = lines
      .map((l) => JSON.parse(l))
      .filter((item) => {
        const text = `${item.title || ""} ${item.body || ""}`;
        return text.includes(query);
      })
      .slice(0, 5);

    res.status(200).json({ results });
  } catch (err) {
    console.error("search error:", err);
    const msg =
      err.code === "ENOENT"
        ? "data.jsonl not found"
        : err.message || "failed to search";
    res.status(500).json({ error: msg });
  }
};
