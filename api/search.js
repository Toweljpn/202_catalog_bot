import fs from "fs";
import path from "path";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { query } = await req.json();
  const filepath = path.join(process.cwd(), "public", "product.jsonl");
  const raw = fs.readFileSync(filepath, "utf8");

  const lines = raw.trim().split("\n");

  const results = lines
    .map((l) => JSON.parse(l))
    .filter((item) =>
      item.body.includes(query) || item.title.includes(query)
    )
    .slice(0, 5);

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
}
