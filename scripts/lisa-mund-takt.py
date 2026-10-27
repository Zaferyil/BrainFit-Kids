# Lautstärke der Lektionsstimme in 1/25 s → Mundöffnung 0 (zu), 1 (halb), 2 (offen) für das Lernvideo.
# Aufruf: python3 scripts/lisa-mund-takt.py lektion-1
import json, subprocess, sys
import numpy as np

lid = sys.argv[1]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'src/assets/lektionen/{lid}-ton.mp3', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
step = 16000 // 25
rms = np.array([np.sqrt(np.mean(a[i:i + step] ** 2)) for i in range(0, len(a) - step, step)])
ref = np.percentile(rms[rms > 0.01], 70) if np.any(rms > 0.01) else 1
lvl = np.where(rms < 0.15 * ref, 0, np.where(rms < 0.6 * ref, 1, 2))
# kein Flackern: einzelne Bilder an die Nachbarn angleichen
for i in range(1, len(lvl) - 1):
    if lvl[i - 1] == lvl[i + 1] != lvl[i]: lvl[i] = lvl[i - 1]
json.dump({'fps': 25, 'mund': ''.join(map(str, lvl))}, open(f'src/assets/lektionen/{lid}-mund.json', 'w'))
print(len(lvl), 'Bilder', np.bincount(lvl))
