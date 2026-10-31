# SeZa-Kostüme zusammensetzen: Kopf (scripts/seza-kopf.png) hinter das Kostüm (Kostüm ohne Figur),
# Ergebnis nach src/assets/seza/<id>.webp und Ankerpunkte nach src/data/seza-anker.json.
# Aufruf: python3 scripts/seza-kostueme.py <Ordner mit den Kostüm-PNGs>
import json, sys, os
from PIL import Image

QUELLE = sys.argv[1]
ZIEL = 'src/assets/seza'
KOPF = Image.open('scripts/seza-kopf.png').convert('RGBA')
# Maße im Kopfbild (Anteile): Gesichtsbreite, Gesichtsmitte, Kinn, Augenmitte, Augenbreite
K = json.load(open('scripts/seza-kopf.json'))

# Datei → Kostüm-ID (IDs bleiben, damit gekaufte Kostüme erhalten bleiben); Marken-Kostüme (Batman, Iron Man,
# Spider-Man, Captain America) werden bewusst nicht übernommen
KOSTUEME = {
  '01_Ogrenci': 'original', '05_Yesil_Sporcu': 'sportler', '07_Kasif': 'entdecker', '02_Astronot': 'astronaut',
  '03_Super_Kahraman': 'superheld', '04_Sihirbaz': 'zauberer', '06_Doktor': 'wissenschaftler', '08_Kislik': 'winterheld',
  '09_Mezuniyet': 'genie', '14_Ninja': 'ninja', '15_Sovalye': 'ritter', '16_Itfaiyeci': 'feuerwehr',
}

def deckend(a, x, y): return a.getpixel((x, y)) > 128

anker = {}
for datei, kid in KOSTUEME.items():
  k = Image.open(os.path.join(QUELLE, datei + '.png')).convert('RGBA')
  k = k.crop(k.getbbox()); a = k.getchannel('A'); w, h = k.size
  # Zeilen in der Mitte: wo ist das Gesicht frei (Lücke zwischen Hut/Helm und Kragen)?
  mitte = range(w // 2 - w // 10, w // 2 + w // 10)
  voll = [sum(deckend(a, x, y) for x in mitte) / len(mitte) > .5 for y in range(h)]
  # Abschnitte (deckend / frei) von oben
  ab = []
  for y in range(h):
    if ab and ab[-1][0] == voll[y]: ab[-1][2] = y
    else: ab.append([voll[y], y, y])
  lang = lambda t: t[2] - t[1] + 1
  erstes = next(t for t in ab if t[0] and lang(t) >= 5)
  if lang(erstes) > h * .45:
    oben, kragen = 0, erstes[1]          # kein Hut: Kostüm beginnt mit dem Kragen (Doktor)
  else:
    i = ab.index(erstes) + 1
    while not (not ab[i][0] and lang(ab[i]) > 15): i += 1
    oben = ab[i][1]
    j = i + 1
    while not (ab[j][0] and lang(ab[j]) >= 10): j += 1   # kleine Inseln überspringen
    kragen = ab[j][1]
  if kid == 'wissenschaftler':           # Kittel ohne Kopfbedeckung: Kragen = erste deckende Zeile in der Mitte
    oben, kragen = 0, next(y for y in range(h) if voll[y])
  zeile = (oben + kragen) // 2
  # Loch im Helm/Kapuze? Dann ist links und rechts der Mitte auf Gesichtshöhe deckende Fläche
  links = [x for x in range(0, w // 2) if deckend(a, x, zeile)]
  rechts = [x for x in range(w // 2, w) if deckend(a, x, zeile)]
  # Helme/Kapuzen mit Gesichtsöffnung (alle anderen sind Hüte oder Kostüme ohne Kopfbedeckung)
  loch = kid in ('astronaut', 'ninja', 'ritter')
  if loch:
    l = max(links); r = min(rechts); gesicht = (r - l) * 1.12; mx = (l + r) / 2
  else:
    hut = [sum(deckend(a, x, yy) for x in range(w)) for yy in range(max(1, oben))] if oben else []
    kr = [x for x in range(w) if deckend(a, x, min(h - 1, kragen + 3))]
    breite = max(hut) * .80 if hut else (max(kr) - min(kr)) * .95
    gesicht = breite; mx = (min(kr) + max(kr)) / 2 if kr else w / 2
  if kid == 'superheld':               # nur Augenmaske: Kopf füllt Maske bis Kragen
    m = [x for x in range(w) for yy in range(0, oben) if deckend(a, x, yy)]
    mx = (min(m) + max(m)) / 2
    gesicht = (max(m) - min(m)) * 1.2
  if kid == 'wissenschaftler': gesicht = w * .8; mx = w / 2
  s = gesicht / (K['gesicht_b'] * KOPF.width)
  kopf = KOPF.resize((round(KOPF.width * s), round(KOPF.height * s)), Image.LANCZOS)
  kx = round(mx - K['mitte_x'] * kopf.width)
  ky = round(kragen + gesicht * .06 - K['kinn_y'] * kopf.height)
  if kid == 'superheld': ky = round(oben / 2 - (K['augen_y'] - .13) * kopf.height)
  # Leinwand groß genug für Kopf über dem Kostüm
  rand = max(0, -ky, -kx, kx + kopf.width - w)
  bild = Image.new('RGBA', (w + 2 * rand, h + rand), (0, 0, 0, 0))
  # Kopf über dem Gesicht beschneiden: oberhalb der Gesichtsöffnung (Hut/Helm) und bei Helmen auch seitlich
  # nur innerhalb der Kostüm-Umrisse, damit Haare nicht unter dem Hut hervorquellen
  maske = Image.new('L', kopf.size, 255)
  if oben > 0 and kid != 'superheld':
    mp = maske.load()
    for yy in range(kopf.height):
      cy = yy + ky
      if cy >= kragen: break
      if cy < oben or loch:
        xs = [x for x in range(w) if deckend(a, x, cy)] if 0 <= cy < h else []
        l, r = (min(xs), max(xs)) if xs else (1, 0)
        for xx in range(kopf.width):
          cx = xx + kx
          if not (l <= cx <= r): mp[xx, yy] = 0
  from PIL import ImageChops, ImageFilter
  kopf.putalpha(ImageChops.multiply(kopf.getchannel('A'), maske.filter(ImageFilter.GaussianBlur(1))))
  bild.alpha_composite(kopf, (kx + rand, ky + rand))
  bild.alpha_composite(k, (rand, rand))
  box = bild.getbbox(); bild = bild.crop(box); W, H = bild.size
  ox, oy = rand - box[0], rand - box[1]
  # Hand rechts: rechteste deckende Stelle im oberen Körper
  beste = (0, 0)
  for yy in range(kragen, kragen + (h - kragen) // 2):
    xs = [x for x in range(w - 1, w // 2, -1) if deckend(a, x, yy)]
    if xs and xs[0] > beste[0]: beste = (xs[0], yy)
  hx, hy = beste
  augen_x = (kx + K['augen_x'] * kopf.width + ox) / W
  augen_y = (ky + K['augen_y'] * kopf.height + oy) / H
  anker[kid] = {
    'augen': {'x': round(augen_x, 3), 'y': round(augen_y, 3), 'b': round(K['augen_b'] * kopf.width / W, 3)},
    'hand': {'x': round((hx - w * .04 + ox) / W, 3), 'y': round((hy - h * .02 + oy) / H, 3), 'b': .3, 'r': 12},
    'begleiter': {'x': .12, 'y': .9},
    'kopf': {'x': round((kx + K['mitte_x'] * kopf.width + ox) / W, 3), 'y': round((ky + oy) / H, 3)},
    'kopfFrei': oben == 0 or kid == 'superheld',
    'ausschnitt': f"{round(augen_x * 100)}% {round(max(0, augen_y - .08) * 100)}%",
  }
  bild.thumbnail((520, 520), Image.LANCZOS)
  bild.save(os.path.join(ZIEL, kid + '.webp'), quality=88)
  print(kid, (W, H), 'Loch' if loch else 'Hut' if oben else 'frei')
anker['superheld'].pop('augen', None)  # Maske: keine Brille darüber
json.dump(anker, open('src/data/seza-anker.json', 'w'), indent=1)
