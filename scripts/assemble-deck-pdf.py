from pathlib import Path
import json
import pymupdf as fitz
from PIL import Image, ImageOps, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]
work=root/'tmp'/'pdfs'/'current-deck'
manifest=json.loads((work/'manifest.json').read_text(encoding='utf-8'))
output=root/'output'/'pdf'/'StatOz Investor Deck - 18 Nov 2026.pdf'
output.parent.mkdir(parents=True,exist_ok=True)
width,height=960,540
pdfmetrics.registerFont(TTFont('DeckText','C:/Windows/Fonts/arial.ttf'))
pdf=canvas.Canvas(str(output),pagesize=(width,height),pageCompression=1)
pdf.setTitle('StatOz - Investor Deck - 18 November 2026')
pdf.setAuthor('StatOz')
pdf.setSubject('Current investor deck with fully revealed slides and appendix')
for index,slide in enumerate(manifest['slides']):
    pdf.bookmarkPage(slide['id'])
    pdf.addOutlineEntry(slide['title'],slide['id'],level=0)
    # Full-resolution 4:4:4 JPEG keeps small interface labels sharp while making
    # the complete deck practical to email and share.
    compressed=work/(Path(slide['image']).stem+'.jpg')
    Image.open(slide['image']).convert('RGB').save(compressed,quality=94,subsampling=0,optimize=True)
    pdf.drawImage(ImageReader(str(compressed)),0,0,width=width,height=height)
    # Preserve searchable slide copy without changing the exact website artwork.
    text=pdf.beginText(4,height-4)
    text.setFont('DeckText',1)
    text.setLeading(1.2)
    text.setTextRenderMode(3)
    for line in slide['text'].splitlines():
        if line.strip():text.textLine(line)
    pdf.drawText(text)
    for link in slide['links']:
        x=link['x']/2;y=height-(link['y']+link['height'])/2
        pdf.linkURL(link['href'],(x,y,x+link['width']/2,y+link['height']/2),relative=0,thickness=0)
    pdf.showPage()
pdf.save()
reader=PdfReader(output)
assert len(reader.pages)==len(manifest['slides'])
for page,slide in zip(reader.pages,manifest['slides']):
    assert abs(float(page.mediabox.width)-width)<.01
    assert abs(float(page.mediabox.height)-height)<.01
    assert 'StatOz' in page.extract_text()
render=work/'verification';render.mkdir(exist_ok=True)
doc=fitz.open(output)
thumbs=[]
for index,page in enumerate(doc):
    pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
    target=render/f'page-{index+1:02d}.png';pix.save(target)
    image=Image.open(target).convert('RGB')
    assert image.getextrema()[0][0]!=image.getextrema()[0][1]
    thumb=ImageOps.contain(image,(480,270))
    tile=Image.new('RGB',(500,306),'#e8ebef');tile.paste(thumb,(10,8))
    ImageDraw.Draw(tile).text((10,282),f"{index+1:02d}  {manifest['slides'][index]['title']}",fill='#111111')
    thumbs.append(tile)
sheet=Image.new('RGB',(2000,306*((len(thumbs)+3)//4)),'#e8ebef')
for index,tile in enumerate(thumbs):sheet.paste(tile,((index%4)*500,(index//4)*306))
sheet.save(render/'contact-sheet.png')
print(json.dumps({'path':str(output),'pages':len(doc),'bytes':output.stat().st_size,'rendered':str(render)},indent=2))
