const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query } = req.body || {};
  if (!query) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), "public", "data.jsonl");
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.trim().split("\n");

    const results = lines
      .map((l) => JSON.parse(l))
      .filter((item) => {
        const text = `${item.title || ""} ${item.body || ""}`;
        return text.includes(query);
      })
      .slice(0, 5);

    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to search" });
  }
};
