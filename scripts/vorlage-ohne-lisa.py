# Lernvideo-Vorlage ohne Lehrerin: Lisa links wird durch den weich gezeichneten Raum ersetzt.
# Aufruf: python3 scripts/vorlage-ohne-lisa.py → src/assets/lehrerin/vorlage-raum-1080.jpg
import cv2
import numpy as np

im = cv2.imread('src/assets/lehrerin/vorlage-creme-1080.jpg')
# Lisas Hand am Tafelrand übermalen
hand = np.zeros(im.shape[:2], np.uint8)
cv2.ellipse(hand, (585, 432), (75, 38), -15, 0, 360, 255, -1)
im = cv2.inpaint(im, hand, 9, cv2.INPAINT_TELEA)
# auf der Tafel selbst: mit der Tafelfarbe füllen (sie ist gleichmäßig hell)
tafel = np.median(im[400:470, 680:760].reshape(-1, 3), axis=0)
fl = hand.copy(); fl[:, :562] = 0
fl = cv2.GaussianBlur(fl, (21, 21), 0)[..., None] / 255.0
im = (im * (1 - fl) + tafel * fl).astype(np.uint8)
# Holzrahmen links an der Stelle der Hand: senkrecht aus dem Stück darüber fortsetzen
oben, unten = im[378, 530:580].astype(float), im[502, 530:580].astype(float)
for y in range(379, 502):
    u = (y - 378) / 124
    im[y, 530:580] = (oben * (1 - u) + unten * u).astype(np.uint8)
h, w = im.shape[:2]
X = 544                                    # linke Kante der Tafel
left = im[:, :X].copy()
# Raum aus dem Streifen ganz links und dem Rand neben der Tafel ableiten: stark verwischt, Lisa verschwindet
small = cv2.resize(left, (X // 16, h // 16), interpolation=cv2.INTER_AREA)
mask = np.zeros(small.shape[:2], np.uint8)
mask[int(90 / 16):, int(80 / 16):int(650 / 16)] = 255   # Bereich der Figur
small = cv2.inpaint(small, mask, 6, cv2.INPAINT_TELEA)
room = cv2.GaussianBlur(cv2.resize(small, (X, h), interpolation=cv2.INTER_CUBIC), (0, 0), 25)
# weicher Übergang zum Original nahe der Tafel
a = np.clip((np.arange(X) - (X - 6)) / 6, 0, 1)[None, :, None]
out = im.copy()
out[:, :X] = (room * (1 - a) + left * a).astype(np.uint8)
cv2.imwrite('src/assets/lehrerin/vorlage-raum-1080.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 88])
