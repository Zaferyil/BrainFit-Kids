# Zerlegt die Video-Grafiken (docs/referenz/video-ui) in Bausteine für das Studio:
#   Abakus: leere Rahmen für 1–8 Stangen, Perlen, Markierungspunkt
#   Lektion-Schild und Fortschritt ohne Text, Fortschrittspunkte, Zurück-Knopf, Klassen-Schild
# Aufruf: python3 scripts/video-assets.py
import numpy as np
from PIL import Image

SRC = 'docs/referenz/video-ui'
OUT = 'src/assets/video'

ab = np.asarray(Image.open(f'{SRC}/abakus.webp').convert('RGBA')).copy()
CENTERS = [239.5, 451, 668.5, 886.5, 1104.5, 1322.5, 1540.5, 1755.5]
PITCH = 217
BEAD_W = 194

def crop(arr, x0, y0, x1, y1):
    return Image.fromarray(arr[y0:y1, x0:x1])

# Perlen (Ruhelage): Himmelsperle 85–192, Erdperlen 300–385 (oberste, ganz sichtbar)
def bead(col, y0, y1):
    c = CENTERS[col]
    return crop(ab, int(c - BEAD_W / 2), y0, int(c + BEAD_W / 2), y1)
bead(3, 84, 193).save(f'{OUT}/perle-himmel.png')
bead(3, 299, 387).save(f'{OUT}/perle-erde.png')
bead(2, 299, 387).save(f'{OUT}/perle-markiert.png')
crop(ab, 1086, 236, 1123, 271).save(f'{OUT}/punkt.png')

# Leere Spalte: Perlen entfernen, Stange durchziehen, unteren Rahmen ergänzen
col = ab.copy()
c = int(CENTERS[3])
x0, x1 = c - 104, c + 104
rod = ab[214:215, c - 30:c + 31].copy()            # eine Zeile der Stange (senkrecht gleichmäßig)
frame_bottom = ab[560:660, 345:346].copy()          # unterer Rahmen in einer Lücke ohne Stange
for (y0, y1) in [(83, 200), (290, 618)]:
    col[y0:y1, x0:x1] = 0
    for y in range(y0, y1):
        col[y, c - 30:c + 31] = rod[(y - y0) % rod.shape[0]]
# unterer Rahmen über die ganze Spaltenbreite (wo die unterste Perle ihn verdeckt hat)
for x in range(x0, x1):
    m = frame_bottom[:, 0, 3] > 0
    seg = col[560:660, x]
    seg[m] = frame_bottom[m, 0]
# Stange über dem unteren Rahmen wieder sichtbar machen (nur bis zum Rahmen)
tile = col[:, int(CENTERS[3] - PITCH / 2):int(CENTERS[3] + PITCH / 2)]
left = ab[:, 56:int(CENTERS[0] - PITCH / 2)]
right = ab[:, int(CENTERS[7] + PITCH / 2):1946]
# linker/rechter Rand dürfen keine Perlenreste enthalten: Rand bis zur ersten Perle
for n in range(1, 9):
    img = np.concatenate([left] + [tile] * n + [right], axis=1)
    Image.fromarray(img[14:655]).save(f'{OUT}/rahmen-{n}.png')

# Lektion-Schild: Text entfernen (senkrecht zwischen sauberen Zeilen interpolieren)
sh = np.asarray(Image.open(f'{SRC}/lektion-schild.webp').convert('RGBA')).astype(float).copy()
ya, yb = 150, 535
# Bezugszeilen waagerecht glätten, damit keine Streifen entstehen
def smooth(row, k=61):
    out = row.copy()
    for x in range(len(row)):
        out[x] = row[max(0, x - k // 2):x + k // 2 + 1].mean(0)
    return out
top, bottom = smooth(sh[ya]), smooth(sh[yb])
for x in range(720, 1700):
    a, b = top[x], bottom[x]
    for y in range(ya, yb):
        t = (y - ya) / (yb - ya)
        sh[y, x] = a + (b - a) * t
img = Image.fromarray(sh.astype('uint8'))
img.crop((140, 60, 1860, 610)).save(f'{OUT}/lektion-schild.png')

# Fortschritt: alle Punkte weiß (blauen Punkt durch weißen ersetzen), Text im Zähler entfernen
pr = np.asarray(Image.open(f'{SRC}/fortschritt.webp').convert('RGBA')).copy()
dots = [195, 523, 817, 1108, 1403]
blue = pr[195 - 135:195 + 135, 195 - 135:195 + 135].copy()
white = pr[200 - 110:200 + 110 + 1, 523 - 110:523 + 110 + 1].copy() if False else pr[333 - 100:333 + 100, 523 - 100:523 + 100].copy()
Image.fromarray(pr[333 - 135:333 + 135, 195 - 135:195 + 135]).save(f'{OUT}/punkt-aktiv.png')
Image.fromarray(white).save(f'{OUT}/punkt-leer.png')
base = pr.copy()
# Bereich des blauen Punkts: Schiene von rechts übernehmen, dann weißen Punkt einsetzen
base[333 - 140:333 + 140, 55:330] = 0
track = pr[300:366, 360:400]
for x in range(185, 330):
    base[300:366, x] = track[:, 0]
w = Image.fromarray(white)
bimg = Image.fromarray(base)
bimg.alpha_composite(w, (195 - 100, 333 - 100))
b2 = np.asarray(bimg).astype(float).copy()
ya, yb = 255, 410
for x in range(1640, 1880):
    a, b = b2[ya, x], b2[yb, x]
    for y in range(ya, yb):
        t = (y - ya) / (yb - ya)
        b2[y, x] = a + (b - a) * t
Image.fromarray(b2.astype('uint8')).crop((60, 190, 1950, 480)).save(f'{OUT}/fortschritt.png')

Image.open(f'{SRC}/zurueck.webp').convert('RGBA').crop((90, 90, 1165, 1165)).save(f'{OUT}/zurueck.png')
Image.open(f'{SRC}/klasse.webp').convert('RGBA').crop((95, 100, 1905, 545)).save(f'{OUT}/klasse.png')
print('ok')

# Für die App verkleinern (doppelte Anzeigegröße) und als WebP speichern
import glob, os
SIZES = {'zurueck': 220, 'klasse': 640, 'lektion-schild': 1080, 'fortschritt': 1120, 'punkt-aktiv': 160, 'punkt-leer': 140}
for f in glob.glob(f'{OUT}/*.png'):
    name = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGBA')
    if name in SIZES and im.width > SIZES[name]:
        im = im.resize((SIZES[name], round(im.height * SIZES[name] / im.width)), Image.LANCZOS)
    im.save(f'{OUT}/{name}.webp', quality=90, method=6)
    os.remove(f)
print('webp ok')
