#!/usr/bin/env bash
set -euo pipefail

root='docs'
max_size=204800
target=190000
processed=0
failed=0
tmp=""

if ! command -v magick >/dev/null 2>&1; then
  printf 'ERROR: ImageMagick (magick) is required\n' >&2
  exit 127
fi

if [ ! -d "$root" ]; then
  printf 'ERROR: image root does not exist: %s\n' "$root" >&2
  exit 1
fi

if [ "$target" -ge "$max_size" ] || [ "$target" -le 0 ]; then
  printf 'ERROR: target must be positive and smaller than max_size\n' >&2
  exit 1
fi

cleanup() {
  if [ -n "$tmp" ] && [ -e "$tmp" ]; then
    rm -f -- "$tmp"
  fi
}

interrupt() {
  cleanup
  exit 130
}

trap cleanup EXIT
trap interrupt INT TERM

file_size() {
  wc -c < "$1" | tr -d '[:space:]'
}

while IFS= read -r -d '' src; do
  orig_size=$(file_size "$src")
  [ "$orig_size" -gt "$max_size" ] || continue

  dir=${src%/*}
  base=${src##*/}
  ext_lower=$(printf '%s' "${base##*.}" | tr '[:upper:]' '[:lower:]')
  # Keep the temporary file beside the source for an atomic replacement.
  tmp=$(mktemp "$dir/.${base}.compressed.XXXXXX.tmp")

  if [ "$ext_lower" = "jpg" ] || [ "$ext_lower" = "jpeg" ]; then
    # Generate every candidate from the original to avoid repeated lossy encoding.
    for scale in 100 85 72 61 52 44 37; do
      q=$(( scale == 100 ? 78 : 72 ))
      magick "$src" \
        -auto-orient \
        -strip \
        -resize '1800x1800>' \
        -resize "${scale}%" \
        -interlace Plane \
        -sampling-factor 4:2:0 \
        -quality "$q" \
        "jpg:$tmp"
      [ "$(file_size "$tmp")" -le "$target" ] && break
    done
  else
    # Preserve full color first; quantize only when that does not meet the target.
    magick "$src" \
      -strip \
      -resize '1800x1800>' \
      -define png:compression-level=9 \
      "png:$tmp"
    # 若仍超标，再从原图出发启用 256 色量化并逐步缩放
    if [ "$(file_size "$tmp")" -gt "$target" ]; then
      for scale in 100 85 72 61 52 44 37; do
        magick "$src" \
          -strip \
          -resize '1800x1800>' \
          -resize "${scale}%" \
          -colors 256 \
          -define png:compression-level=9 \
          "png:$tmp"
        [ "$(file_size "$tmp")" -le "$target" ] && break
      done
    fi
  fi

  final_size=$(file_size "$tmp")
  if [ "$final_size" -le "$max_size" ] && [ "$final_size" -lt "$orig_size" ]; then
    mv -- "$tmp" "$src"
    processed=$((processed + 1))
    if [ "$final_size" -gt "$target" ]; then
      printf 'WARNING preferred target not reached: %s (%s bytes)\n' \
        "$src" "$final_size" >&2
    fi
  else
    if [ "$final_size" -gt "$max_size" ]; then
      printf 'WARNING maximum size not reached, keeping original: %s (%s bytes)\n' \
        "$src" "$final_size" >&2
    else
      printf 'WARNING result is not smaller, keeping original: %s (%s bytes)\n' \
        "$src" "$final_size" >&2
    fi
    failed=$((failed + 1))
    rm -f -- "$tmp"
  fi
  tmp=""
done < <(find "$root" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -size +200k -print0)

printf 'processed=%d failed=%d\n' "$processed" "$failed"
if [ "$failed" -ne 0 ]; then
  exit 1
fi