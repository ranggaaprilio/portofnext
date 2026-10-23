#!/usr/bin/env bash
# Rebuild every model into public/models/. Optional: a directory for preview
# renders, and script names to limit the build (e.g. `build.sh /tmp/p ship`).
#
#   BLENDER=/path/to/Blender blender/build.sh [preview-dir] [script ...]
set -euo pipefail

BLENDER="${BLENDER:-$HOME/Local Applications/Blender.app/Contents/MacOS/Blender}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREVIEW_DIR="${1:-}"
shift || true

# script name -> output file name
MODELS=(
  "ship:ship"
  "planet_radar:planet-radar"
  "station_hub:station-hub"
  "asteroid_workshop:asteroid-workshop"
  "planet_ocean:planet-ocean"
  "planet_satellite:planet-satellite"
  "vault_gate:vault-gate"
  "asteroids:asteroids"
)

mkdir -p "$ROOT/public/models"
for entry in "${MODELS[@]}"; do
  script="${entry%%:*}"
  out="${entry##*:}"
  if [[ $# -gt 0 && ! " $* " =~ " $script " ]]; then
    continue
  fi
  args=(--out "$ROOT/public/models/$out.glb")
  [[ -n "$PREVIEW_DIR" ]] && args+=(--preview "$PREVIEW_DIR/$out.png")
  echo "→ $script"
  "$BLENDER" --background --factory-startup --python "$ROOT/blender/$script.py" -- "${args[@]}" \
    | grep -E "Error|Traceback|Saved" || true
done
