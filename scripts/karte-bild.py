# Macht aus der Karten-Vorlage (docs/referenz/karte-vorlage.webp) den leeren Inselhintergrund:
# Stationsnummern, Sterne und die Figur werden übermalt, Kopf- und Fußleiste abgeschnitten.
# Aufruf: python3 scripts/karte-bild.py docs/referenz/karte-vorlage.webp src/assets/karte/insel.webp
import sys
import cv2
import numpy as np

im = cv2.imread(sys.argv[1])
m = np.zeros(im.shape[:2], np.uint8)
# Mittelpunkte der 12 Stationen in der Vorlage (gleiche Liste wie SLOTS in src/screens/Weltkarte.tsx, dort ohne Kopfleiste)
B = [(555,1305),(325,1178),(157,1055),(262,845),(449,925),(700,1003),(766,800),(559,670),(329,603),(319,430),(565,395),(700,295)]
for x, y in B:
    cv2.circle(m, (x, y), 44, 255, -1)
    cv2.ellipse(m, (x, y + 38), (48, 22), 0, 0, 360, 255, -1)
cv2.ellipse(m, (388, 1365), (78, 120), 0, 0, 360, 255, -1)   # Figur
cv2.rectangle(m, (300, 1255), (470, 1480), 255, -1)
out = cv2.inpaint(im, cv2.dilate(m, np.ones((5, 5))), 9, cv2.INPAINT_TELEA)
out[1385:1480, 436:572] = im[1385:1480, 436:572]   # Start-Schild unverändert lassen
out = out[132:1535]
cv2.imwrite(sys.argv[2], out, [cv2.IMWRITE_WEBP_QUALITY, 82])
