# Lernvideo-Vorlage mit der Tafel in der Bildmitte: Tafel aus vorlage-raum-1080.jpg um DX verschieben,
# Hintergrund ist der weich gezeichnete Raum. Aufruf: python3 scripts/vorlage-mitte.py
import cv2
import numpy as np

DX = -248                                   # Tafelmitte 1208 → 960 (gleicher Wert in .sf-chalk.creme)
im = cv2.imread('src/assets/lehrerin/vorlage-raum-1080.jpg')
h, w = im.shape[:2]
# Raum nur aus dem (schon verwischten) Streifen links der Tafel, gespiegelt – keine Geisterbilder der Tafel
links = im[:, :530]
streifen = np.hstack([links, links[:, ::-1], links, links[:, ::-1]])[:, :w]
raum = cv2.GaussianBlur(streifen, (0, 0), 20)
x0, x1 = 536, 1890                          # Tafel samt Rahmen und Füßen
tafel = im[:, x0:x1]
mask = np.zeros((h, x1 - x0), np.float32)
mask[40:1040, 4:-4] = 1
mask = cv2.GaussianBlur(mask, (0, 0), 3)[..., None]
out = raum.copy().astype(np.float32)
out[:, x0 + DX:x1 + DX] = tafel * mask + out[:, x0 + DX:x1 + DX] * (1 - mask)
cv2.imwrite('src/assets/lehrerin/vorlage-mitte-1080.jpg', out.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])

# Nur die Tafel (ohne Raum) als PNG mit Transparenz – für den App-Hintergrund im Lernvideo
from PIL import Image, ImageDraw
L, T, R, B, RAD = 300, 50, 1612, 962, 86
tafel_png = Image.open('src/assets/lehrerin/vorlage-mitte-1080.jpg').convert('RGBA')
maske = Image.new('L', tafel_png.size, 0)
ImageDraw.Draw(maske).rounded_rectangle((L, T, R, B), RAD, fill=255)
tafel_png.putalpha(maske)
tafel_png.crop((L, T, R + 1, B + 1)).save('src/assets/lehrerin/tafel.webp', quality=88)
