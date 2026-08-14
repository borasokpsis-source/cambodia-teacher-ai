import pypdf
import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("extracted_tocs.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for key, item in data.items():
    print(f"\n================ {key} ================")
    sample = item["toc_sample"]
    lines = [line.strip() for line in sample.split("\n") if line.strip()]
    print(f"Total non-empty lines extracted from first 15 pages: {len(lines)}")
    if lines:
        print("First 15 lines extracted:")
        for line in lines[:15]:
            print("  >", repr(line))
    else:
        print("NO TEXT extracted! (PDF may be scanned image PDF)")
