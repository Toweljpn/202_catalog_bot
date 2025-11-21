import csv
import json
import argparse
from pathlib import Path

def csv_to_jsonl(csv_file: str, jsonl_file: str, encoding="utf-8"):
    input_path = Path(csv_file)
    output_path = Path(jsonl_file)

    if not input_path.exists():
        raise FileNotFoundError(f"CSVファイルが見つかりません: {csv_file}")

    with input_path.open("r", encoding=encoding, newline="") as f_in, \
         output_path.open("w", encoding="utf-8") as f_out:

        reader = csv.DictReader(f_in)

        for row in reader:
            # 空行はスキップ
            if not any(row.values()):
                continue

            # CSVの列名 → JSONLのキーに変換
            item = {
                "id": row.get("管理番号", "").strip(),
                "artist": row.get("作家", "").strip(),
                "width": row.get("間口", "").strip(),
                "depth": row.get("奥行", "").strip(),
                "height": row.get("高さ", "").strip(),
                "title": row.get("タイトル", "").strip(),
                "price": row.get("価格", "").strip(),
                "description": row.get("本文", "").strip(),
            }

            json_line = json.dumps(item, ensure_ascii=False)
            f_out.write(json_line + "\n")

    print(f"変換完了: {output_path.resolve()}")

def main():
    parser = argparse.ArgumentParser(description="製品CSVをJSONLに変換するツール")
    parser.add_argument("csv_file", help="入力CSVファイル")
    parser.add_argument("jsonl_file", help="出力JSONLファイル")
    parser.add_argument("--encoding", default="utf-8", help="CSVの文字コード（例: utf-8, shift_jis）")

    args = parser.parse_args()
    csv_to_jsonl(args.csv_file, args.jsonl_file, args.encoding)

if __name__ == "__main__":
    main()
