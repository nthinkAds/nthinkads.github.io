"""
pdf_to_images.py - turn chosen PDF pages into web images for the N Think site.

Run it from the nthink-site folder:
    python tools/pdf_to_images.py "C:/path/to/File.pdf" folder-name 1 3 4

    "C:/path/to/File.pdf"  the PDF to read (keep the quotes if the path has spaces)
    folder-name            new folder it creates in assets/work (lowercase, dashes, no spaces)
    1 3 4                  page numbers to keep (leave them out to keep every page)

For each page it saves two files: 01.webp (large, for the viewer) and 01-t.webp
(small thumbnail, for the grid). At the end it prints a line to paste into content.js.

Needs two libraries, installed once with:
    pip install pymupdf pillow
"""
import os
import sys

try:
    import pymupdf as fitz      # PyMuPDF: opens PDFs and draws pages as pictures (new name)
except ImportError:
    import fitz                 # same library, older versions use this name
from PIL import Image           # Pillow: resizes and saves the pictures as .webp

LARGE = 1600                    # longest side of the big image, in pixels
THUMB = 700                     # longest side of the thumbnail

# 1. Read what was typed after the script name
if len(sys.argv) < 3:
    print(__doc__)              # no PDF or folder given: show the instructions above
    sys.exit(1)
pdf_path, slug = sys.argv[1], sys.argv[2]
doc = fitz.open(pdf_path)
pages = [int(n) for n in sys.argv[3:]] or list(range(1, len(doc) + 1))

# Check every page number first, so nothing is half-done if one is wrong
wrong = [n for n in pages if n < 1 or n > len(doc)]
if wrong:
    print(f'This PDF has {len(doc)} pages, so these page numbers do not exist: {wrong}')
    sys.exit(1)

# 2. Make the output folder, e.g. assets/work/house-interior
out_dir = os.path.join('assets', 'work', slug)
os.makedirs(out_dir, exist_ok=True)

sizes = []
for i, page_no in enumerate(pages, start=1):
    page = doc[page_no - 1]                                   # PDF pages count from 0 in code
    zoom = LARGE / max(page.rect.width, page.rect.height)     # scale so the longest side is LARGE
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))     # draw the page
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)

    name = f'{i:02d}'                                         # 01, 02, 03 ...
    img.save(os.path.join(out_dir, name + '.webp'), quality=82)
    thumb = img.copy()
    thumb.thumbnail((THUMB, THUMB))                           # shrink, keeping the shape
    thumb.save(os.path.join(out_dir, name + '-t.webp'), quality=78)

    sizes.append([img.width, img.height])
    print(f'page {page_no} -> {out_dir}/{name}.webp ({img.width} x {img.height})')

# 3. The line to paste into the project's block in content.js
print('\nPaste this as the project\'s media line in assets/js/content.js:')
print(f"    media: imgs('{slug}', {sizes})")
