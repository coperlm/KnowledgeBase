#!/usr/bin/env bash
set -eu

root='docs'
target=190000
processed=0

for ext in jpg png; do
  while IFS= read -r -d '' src; do
    size=$(stat -c '%s' "$src")
    [ "$size" -gt 204800 ] || continue

    dir=${src%/*}
    base=${src##*/}
    stem=${base%.*}
    tmp="$dir/.${stem}.compressed.$ext"

    if [ "$ext" = jpg ]; then
      magick "$src" \
        -auto-orient \
        -strip \
        -resize '1800x1800>' \
        -interlace Plane \
        -sampling-factor 4:4:4 \
        -quality 78 \
        "$tmp"

      for _ in 1 2 3 4 5 6; do
        [ "$(stat -c '%s' "$tmp")" -le "$target" ] && break
        magick "$tmp" -resize '85%' -quality 72 "$tmp"
      done
    else
      magick "$src" \
        -strip \
        -resize '1800x1800>' \
        -colors 256 \
        -define png:compression-level=9 \
        "$tmp"

      for _ in 1 2 3 4 5 6; do
        [ "$(stat -c '%s' "$tmp")" -le "$target" ] && break
        magick "$tmp" \
          -resize '85%' \
          -colors 256 \
          -define png:compression-level=9 \
          "$tmp"
      done
    fi

    final=$(stat -c '%s' "$tmp")
    if [ "$final" -gt 204800 ]; then
      printf 'WARNING still oversized: %s (%s bytes)\n' "$src" "$final" >&2
    fi

    mv "$tmp" "$src"
    processed=$((processed + 1))
  done < <(find "$root" -type f -iname "*.$ext" -size +200k -print0)
done

printf 'processed=%d\n' "$processed"
