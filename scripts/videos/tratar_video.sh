#!/usr/bin/env bash
# Tratamento dos vídeos originais do lodge para o site (ffmpeg).
#
# Faz o que uma edição profissional faz a um vídeo de telemóvel, sem alterar o conteúdo filmado:
#   1. estabilização em duas passagens (vidstab), para tirar o tremor da mão;
#   2. redução de ruído (hqdn3d) e nitidez ligeira (unsharp);
#   3. correcção de cor moderada (contraste, saturação e gama);
#   4. corte opcional (início e duração), sem som (o site mostra vídeos sem som e sem reprodução automática
#      com som), até 1280 px de largura;
#   5. exporta MP4 (H.264, para todos os browsers) e WebM (VP9, mais leve) e uma imagem de capa (JPEG).
#
# Uso:
#   scripts/videos/tratar_video.sh <original> <nome> [início em s] [duração em s]
# Exemplo:
#   scripts/videos/tratar_video.sh assets-originais/mulotane/videos/piscina.mp4 piscina 2 12
# Resultado em public/videos/mulotane/<nome>.{mp4,webm,jpg}.
#
# Os originais ficam em assets-originais/mulotane/videos/ (fora da área pública). Nunca se usam vídeos de
# outros sítios nem se inventam ligações: sem ficheiros originais do lodge, o site não mostra vídeos.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  sed -n '2,20p' "$0"
  exit 1
fi

original="$1"
nome="$2"
inicio="${3:-0}"
duracao="${4:-}"
raiz="$(cd "$(dirname "$0")/../.." && pwd)"
destino="$raiz/public/videos/mulotane"
mkdir -p "$destino"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

corte=(-ss "$inicio")
[[ -n "$duracao" ]] && corte+=(-t "$duracao")

# Passagem 1: medir o tremor.
ffmpeg -hide_banner -loglevel error -y "${corte[@]}" -i "$original" \
  -vf "vidstabdetect=shakiness=5:accuracy=15:result=$tmp/transf.trf" -f null -

filtros="vidstabtransform=input=$tmp/transf.trf:smoothing=20:zoom=2,"
filtros+="hqdn3d=1.5:1.5:6:6,"
filtros+="eq=contrast=1.05:saturation=1.08:gamma=1.02,"
filtros+="unsharp=5:5:0.5:5:5:0,"
filtros+="scale='min(1280,iw)':-2:flags=lanczos,format=yuv420p"

# Passagem 2: aplicar e exportar.
ffmpeg -hide_banner -loglevel error -y "${corte[@]}" -i "$original" -vf "$filtros" -an \
  -c:v libx264 -preset slow -crf 23 -movflags +faststart "$destino/$nome.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$destino/$nome.mp4" -an \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 "$destino/$nome.webm"
ffmpeg -hide_banner -loglevel error -y -ss 1 -i "$destino/$nome.mp4" -frames:v 1 -q:v 3 "$destino/$nome.jpg"

ls -l "$destino/$nome".*
