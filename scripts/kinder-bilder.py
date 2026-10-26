# Schneidet die Kinderbilder aus docs/referenz/kinder-auswahl.webp (Vorlage „Wer bist du?“):
#   src/assets/kinder/<id>-karte.webp  – Karte ohne Namensschild (Auswahl)
#   src/assets/kinder/<id>.webp        – runder Kopf-Ausschnitt (Avatar oben, Karte, Bild-Passwort)
from PIL import Image, ImageDraw

src = Image.open('docs/referenz/kinder-auswahl.webp').convert('RGB')
IDS = [['lena', 'jonas', 'elif', 'noah'], ['mia', 'ben', 'emma', 'can']]
COLS = [(50, 398), (416, 766), (783, 1125), (1142, 1488)]
ROWS = [(181, 508, 443), (525, 866, 798)]  # oben, unten, Oberkante Namensschild
for r, (y0, y1, label) in enumerate(ROWS):
    for c, (x0, x1) in enumerate(COLS):
        kid = IDS[r][c]
        card = src.crop((x0 + 6, y0 + 6, x1 - 6, label - 2))
        card.save(f'src/assets/kinder/{kid}-karte.webp', quality=88)
        cx, cy, s = (x0 + x1) // 2, y0 + 128, 236
        face = src.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)).resize((200, 200), Image.LANCZOS)
        mask = Image.new('L', face.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 199, 199), fill=255)
        out = Image.new('RGBA', face.size, (0, 0, 0, 0))
        out.paste(face, (0, 0), mask)
        out.save(f'src/assets/kinder/{kid}.webp', quality=90)
print('ok')
