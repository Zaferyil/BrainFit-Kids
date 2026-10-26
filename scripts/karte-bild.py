# Macht aus einer Karten-Vorlage den leeren Inselhintergrund: Stationsnummern, Sterne und Figuren werden
# übermalt, Kopf- und Fußleiste abgeschnitten. Die Mittelpunkte sind dieselben wie in src/data/karten.ts
# (dort ohne Kopfleiste, also y - top).
# Aufruf: python3 scripts/karte-bild.py
import cv2
import numpy as np

KARTEN = [
    {
        'quelle': 'docs/referenz/karte-vorlage.webp', 'ziel': 'src/assets/karte/insel.webp', 'top': 132, 'bottom': 1535,
        'punkte': [(555,1305),(325,1178),(157,1055),(262,845),(449,925),(700,1003),(766,800),(559,670),(329,603),(319,430),(565,395),(700,295)],
        'figur': True,
    },
    {
        'quelle': 'docs/referenz/karte-vorlage-2.webp', 'ziel': 'src/assets/karte/insel-2.webp', 'top': 128, 'bottom': 1535,
        'punkte': [(307,1338),(402,1213),(645,1087),(297,985),(524,820),(702,700),(513,630),(281,580),(357,467),(568,478),(744,425),(715,320)],
        'figur': False,
    },
    {
        'quelle': 'docs/referenz/karte-vorlage-3.webp', 'ziel': 'src/assets/karte/insel-3.webp', 'top': 128, 'bottom': 1535,
        'punkte': [(366,1348),(558,1188),(297,945),(535,810),(701,1040),(663,670),(331,550),(381,425),(704,430),(529,362),(773,303)],
        'figur': False,
    },
    {
        'quelle': 'docs/referenz/karte-vorlage-4.webp', 'ziel': 'src/assets/karte/insel-4.webp', 'top': 128, 'bottom': 1535,
        'punkte': [(366,1368),(498,1228),(595,1043),(263,933),(478,762),(664,720),(357,561),(260,419),(546,363),(732,466),(770,300)],
        'figur': False,
    },
    {
        'quelle': 'docs/referenz/karte-vorlage-5.webp', 'ziel': 'src/assets/karte/insel-5.webp', 'top': 128, 'bottom': 1535,
        'punkte': [(392,1325),(663,1210),(463,1077),(685,970),(428,898),(573,773),(321,680),(647,610),(470,515),(285,425),(491,365),(635,305)],
        'figur': False,
    },
]

for k in KARTEN:
    im = cv2.imread(k['quelle'])
    m = np.zeros(im.shape[:2], np.uint8)
    for x, y in k['punkte']:
        cv2.circle(m, (x, y), 44, 255, -1)
        cv2.ellipse(m, (x, y + 38), (48, 22), 0, 0, 360, 255, -1)
    if k['figur']:
        cv2.ellipse(m, (388, 1365), (78, 120), 0, 0, 360, 255, -1)
        cv2.rectangle(m, (300, 1255), (470, 1480), 255, -1)
    out = cv2.inpaint(im, cv2.dilate(m, np.ones((5, 5))), 9, cv2.INPAINT_TELEA)
    if k['figur']:
        out[1385:1480, 436:572] = im[1385:1480, 436:572]   # Start-Schild unverändert lassen
    cv2.imwrite(k['ziel'], out[k['top']:k['bottom']], [cv2.IMWRITE_WEBP_QUALITY, 72])
    cv2.imwrite('/tmp/claude-0/-home-user-BrainFit-Kids/fb303a68-5eb2-544c-8d38-6cf1f112268d/scratchpad/' + k['ziel'].split('/')[-1] + '-maske.png', m)
