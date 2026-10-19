#!/usr/bin/env bash
# Turns the hero clips into the numbered WebP frames the scroll sequence plays.
#
#   bash tools/build-frames.sh <clips-dir> [fps] [width] [fade-seconds] [webp-quality]
#   bash tools/build-frames.sh "../../retaurant/clips/drafts" 24 854 0.35 62
#   OUT=assets/frames-v2 bash tools/build-frames.sh <clips-dir> 24 854 0.35 50   (autre dossier de sortie)
#
# Clips are taken in name order (1_*.mp4, 2_*.mp4 …) and joined with a short
# cross-fade, which hides small reframes between one clip's end and the next one's start.
# Prints `frames` and `clipStarts` (frame where each clip begins to fade in)
# -> copy both into config/site.config.js "hero".
set -euo pipefail
src="$1"; fps="${2:-24}"; width="${3:-854}"; fade="${4:-0.35}"; q="${5:-62}"
here="$(cd "$(dirname "$0")/.." && pwd)"
out="${OUT:-$here/assets/frames}"

clips=("$src"/*.mp4)   # glob order = name order
n=${#clips[@]}
inputs=(); filter=""; starts="0"; acc=0; prev="0:v"

for ((k = 0; k < n; k++)); do
  inputs+=(-i "${clips[$k]}")
  filter+="[$k:v]fps=$fps,scale=$width:-2,settb=AVTB,format=yuv420p[c$k];"
done
for ((k = 0; k < n; k++)); do
  len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${clips[$k]}")
  if ((k > 0)); then
    # offset = output length so far minus the fade
    off=$(awk -v a="$acc" -v d="$fade" 'BEGIN{printf "%.4f", a - d}')
    filter+="[$prev][c$k]xfade=transition=fade:duration=$fade:offset=$off[x$k];"
    prev="x$k"
    starts+=",$(awk -v o="$off" -v f="$fps" 'BEGIN{printf "%d", o * f + 0.5}')"
    acc=$(awk -v o="$off" -v l="$len" 'BEGIN{printf "%.4f", o + l}')
  else
    prev="c0"; acc="$len"
  fi
done
filter="${filter%;}"

rm -f "$out"/*.webp
mkdir -p "$out"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[$prev]" -start_number 0 \
  -c:v libwebp -quality "$q" "$out/%04d.webp"

echo "frames: $(ls "$out" | grep -c '^[0-9]\{4\}\.webp$')"
echo "clipStarts: [$starts]"
