# usage: split.py batches.json batch_index audio.mp3 outdir manifest.json [noise_db] [min_sil]
import json, subprocess, sys, re, hashlib, os
batches, bi, src, out, man = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
noise = sys.argv[6] if len(sys.argv) > 6 else '-40dB'
items = json.load(open(batches))[bi]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)

def segments(dmin):
  r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'silencedetect=noise={noise}:d={dmin}', '-f', 'null', '-'], capture_output=True, text=True).stderr
  starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]
  ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
  segs, t = [], 0.0
  for s, e in zip(starts, ends + [dur] * (len(starts) - len(ends))):
    if s - t > 0.15: segs.append((t, s))
    t = e
  if dur - t > 0.15: segs.append((t, dur))
  return segs

# größte Stille-Schwelle, die genau so viele Abschnitte wie Bausteine ergibt
segs = []
for d in [x / 20 for x in range(40, 4, -1)]:
  segs = segments(d)
  if len(segs) == len(items): break
# Plausibilität: Sprechdauer pro Zeichen
rates = [(b - a) / max(3, len(sp)) for (_, sp), (a, b) in zip(items, segs)] if len(segs) == len(items) else []
bad = [(items[i][1], round(r, 3)) for i, r in enumerate(rates) if not 0.03 < r < 0.2]
print(f'd={d}', bad)
if bad and len(sys.argv) <= 7: sys.exit(2)
print(f'batch {bi}: {len(segs)} Segmente, erwartet {len(items)}')
if len(segs) != len(items):
    for s in segs: print(f'  {s[0]:.2f}-{s[1]:.2f}')
    sys.exit(1)
m = json.load(open(man)) if os.path.exists(man) else {}
for (key, _), (a, b) in zip(items, segs):
    name = 's-' + hashlib.sha1(key.encode()).hexdigest()[:10] + '.mp3'
    a, b = max(0, a - 0.06), min(dur, b + 0.12)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
                    '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ac', '1', '-ar', '22050', '-b:a', '32k', os.path.join(out, name)], check=True)
    m[key] = name
json.dump(m, open(man, 'w'), ensure_ascii=False, indent=1, sort_keys=True)
print('ok')
