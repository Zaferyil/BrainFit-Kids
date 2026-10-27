# Schneidet aus der Vorlage Lisas Mund und erzeugt drei Mundbilder (zu, halb, offen) für das Sprechen im Lernvideo.
# Aufruf: python3 scripts/lisa-mund.py   → src/assets/lehrerin/mund/{zu,halb,offen}.png (Ausschnitt X0,Y0 in 1920×1080)
import cv2
import numpy as np

X0, Y0, X1, Y1 = 300, 258, 410, 326   # Ausschnitt um den Mund (Vorlage 1920×1080)
im = cv2.imread('src/assets/lehrerin/vorlage-creme-1080.jpg')
F = 4   # in vierfacher Größe arbeiten, damit die Kanten glatt bleiben
patch = cv2.resize(im[Y0:Y1, X0:X1], None, fx=F, fy=F, interpolation=cv2.INTER_CUBIC)
hsv = cv2.cvtColor(patch, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(patch, cv2.COLOR_BGR2LAB).astype(int)
# Mund = dunkel, sehr rot oder sehr weiß (Zähne) im Vergleich zur Haut
skin = np.median(lab[:8 * F].reshape(-1, 3), axis=0)
d = np.linalg.norm(lab - skin, axis=2)
mask = (d > 28).astype(np.uint8) * 255
mask[:6 * F] = 0
mask[:30 * F, 42 * F:82 * F] = 0   # Nase ausnehmen
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5 * F, 5 * F), np.uint8))
n, lbl, stats, _ = cv2.connectedComponentsWithStats(mask)
big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
mask = ((lbl == big) * 255).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((5 * F, 5 * F), np.uint8))
ys, xs = np.nonzero(mask)
mx0, mx1, my0, my1 = xs.min(), xs.max(), ys.min(), ys.max()

base = cv2.inpaint(patch, mask, 7 * F, cv2.INPAINT_TELEA)
base = cv2.GaussianBlur(base, (21, 21), 0) * (mask[..., None] > 0) + base * (mask[..., None] == 0)
base = base.astype(np.uint8)

def mouth(scale):
    out = base.copy()
    if scale == 0:
        # geschlossener, lächelnder Mund: Linie entlang der Oberlippe
        # Mundwinkel: linker und rechter Rand der Maske, dazwischen ein leichter Lächel-Bogen
        lx, rx = mx0 + 3, mx1 - 3
        ly = int(np.nonzero(mask[:, lx])[0].min()) + 2
        ry = int(np.nonzero(mask[:, rx])[0].mean())
        pts = []
        for k in range(41):
            u = k / 40
            x = lx + (rx - lx) * u
            y = ly + (ry - ly) * u + 9 * np.sin(np.pi * u)
            pts.append((int(x), int(y)))
        cv2.polylines(out, [np.array(pts)], False, (60, 45, 120), 2, cv2.LINE_AA)
        return out
    # Spalte für Spalte zur Oberlippe hin stauchen (der Mund ist schräg); Ober- und Unterkante geglättet
    a_full = cv2.GaussianBlur(mask, (9, 9), 0) / 255.0
    W = out.shape[1]
    tops = np.full(W, np.nan); bots = np.full(W, np.nan)
    for x in range(W):
        col = np.nonzero(mask[:, x])[0]
        if len(col) >= 2: tops[x], bots[x] = col.min(), col.max()
    ok = ~np.isnan(tops)
    k = np.ones(41) / 41
    def glatt(v):
        f = np.interp(np.arange(W), np.nonzero(ok)[0], v[ok])
        return np.convolve(np.pad(f, 20, mode='edge'), k, mode='valid')
    tops_s, bots_s = glatt(tops), glatt(bots)
    for x in np.nonzero(ok)[0]:
        top, bot = int(round(tops_s[x])), int(round(bots_s[x]))
        if bot - top < 2: continue
        h = bot - top + 1
        nh = max(2, int(round(h * scale)))
        seg = cv2.resize(patch[top:bot + 1, x:x + 1], (1, nh))[:, 0]
        al = cv2.resize(a_full[top:bot + 1, x:x + 1].astype(np.float32), (1, nh))[:, 0][..., None]
        out[top:top + nh, x] = (seg * al + out[top:top + nh, x] * (1 - al)).astype(np.uint8)
    return out

for name, sc in [('zu', 0.28), ('halb', 0.6), ('offen', 1.0)]:
    img = cv2.resize(mouth(sc), (X1 - X0, Y1 - Y0), interpolation=cv2.INTER_AREA)
    # weicher Rand, damit der Ausschnitt nahtlos über der Vorlage liegt
    alpha = np.zeros(img.shape[:2], np.uint8)
    cv2.ellipse(alpha, ((X1 - X0) // 2, (Y1 - Y0) // 2), ((X1 - X0) // 2 - 3, (Y1 - Y0) // 2 - 3), 0, 0, 360, 255, -1)
    alpha = cv2.GaussianBlur(alpha, (15, 15), 0)
    cv2.imwrite(f'src/assets/lehrerin/mund/{name}.png', np.dstack([img, alpha]))
print('Ausschnitt', X0, Y0, X1 - X0, Y1 - Y0)
