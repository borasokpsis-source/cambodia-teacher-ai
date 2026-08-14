import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("extracted_tocs.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Keys in extracted_tocs:", list(data.keys()))

official_curriculum = {}

for key, item in data.items():
    toc_text = item["toc_sample"]
    lines = [line.strip() for line in toc_text.split("\n") if line.strip()]
    
    units_and_lessons = []
    current_unit = "ជំពូកទូទៅ (General Chapter)"
    
    for line in lines:
        # Match Chapter (ជំពូក) or Unit (មេរៀន)
        if "ជំពូក" in line or "មេរៀន" in line or "ផ្នែក" in line:
            units_and_lessons.append(line)

    official_curriculum[key] = {
        "filename": item["filename"],
        "total_pages": item["total_pages"],
        "extracted_lines": units_and_lessons
    }

print("\n--- Extracted Sample Lessons ---")
for key, obj in official_curriculum.items():
    print(f"\n{key} ({obj['filename']}) - Found {len(obj['extracted_lines'])} lesson titles:")
    for line in obj['extracted_lines'][:10]:
        print("  *", line)

with open("parsed_lessons.json", "w", encoding="utf-8") as f:
    json.dump(official_curriculum, f, ensure_ascii=False, indent=2)
