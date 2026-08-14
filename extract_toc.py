import pypdf
import os
import json
import sys

# Ensure UTF-8 output for Windows console
sys.stdout.reconfigure(encoding='utf-8')

pdf_files = {
  "science_g7": "ថ្នាក់ទី៧៖_វិទ្យាសាស្ត្រ.pdf",
  "science_g8": "ថ្នាក់ទី៨៖_វិទ្យាសាស្ត្រ.pdf",
  "science_g9": "ថ្នាក់ទី៩៖_វិទ្យាសាស្ត្រ.pdf",
  "biology_g10": "សៀវភៅជីវវិទ្យាថ្នាក់ទី_១០.pdf",
  "biology_g11": "សៀវភៅពុម្ពថ្នាក់ទី១១​_ជីវៈវិទ្យា.pdf",
  "biology_g12": "សៀវភៅជីវវិទ្យាថ្នាក់ទី១២.pdf",
}

extracted_data = {}

for key, filename in pdf_files.items():
    if not os.path.exists(filename):
        print(f"File not found: {key}")
        continue
    
    print(f"Processing {key} ({filename})...")
    try:
        reader = pypdf.PdfReader(filename)
        num_pages = len(reader.pages)
        print(f"Total pages: {num_pages}")
        
        # Extract text from first 15 pages (where TOC/មាតិកា usually resides)
        toc_text = ""
        for i in range(min(15, num_pages)):
            text = reader.pages[i].extract_text()
            if text:
                toc_text += f"\n--- Page {i+1} ---\n" + text
        
        extracted_data[key] = {
            "filename": filename,
            "total_pages": num_pages,
            "toc_sample": toc_text
        }
    except Exception as e:
        print(f"Error reading {key}: {e}")

with open("extracted_tocs.json", "w", encoding="utf-8") as f:
    json.dump(extracted_data, f, ensure_ascii=False, indent=2)

print("\nSuccessfully extracted TOC samples into extracted_tocs.json!")
