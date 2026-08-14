import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_files = {
  "g7_science": "ថ្នាក់ទី៧៖_វិទ្យាសាស្ត្រ.pdf",
  "g8_science": "ថ្នាក់ទី៨៖_វិទ្យាសាស្ត្រ.pdf",
  "g9_science": "ថ្នាក់ទី៩៖_វិទ្យាសាស្ត្រ.pdf",
  "g10_bio": "សៀវភៅជីវវិទ្យាថ្នាក់ទី_១០.pdf",
  "g11_bio": "សៀវភៅពុម្ពថ្នាក់ទី១១​_ជីវៈវិទ្យា.pdf",
  "g12_bio": "សៀវភៅជីវវិទ្យាថ្នាក់ទី១២.pdf",
}

output_dir = "toc_images"
os.makedirs(output_dir, exist_ok=True)

for key, filename in pdf_files.items():
    if not os.path.exists(filename):
        continue
    
    doc = fitz.open(filename)
    print(f"Extracting TOC images for {key} (Total pages: {len(doc)})...")
    
    # Check pages 1 to 6
    for page_idx in range(1, min(7, len(doc))):
        page = doc[page_idx]
        pix = page.get_pixmap(dpi=150)
        img_path = os.path.join(output_dir, f"{key}_page_{page_idx+1}.png")
        pix.save(img_path)
        print(f"  Saved: {img_path}")

print("\nFinished rendering TOC PNG images!")
