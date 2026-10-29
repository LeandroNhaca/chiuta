#!/usr/bin/env python3
"""Logótipo para a web e ícones do site a partir do logótipo oficial do Mulotana Lodge.

Origem: assets-originais/mulotane/marca/logotipo-perfil-instagram.png, o círculo da fotografia de perfil
do Instagram oficial (@mulotana_lodge), recortado sem perdas de uma captura de ecrã de 1080 px. Não há
ficheiro vectorial do logótipo; quando o lodge o enviar, substitui este recorte.

O desenho não é alterado: o fundo branco passa a transparente com "cor para alfa" (a inversão exacta da
mistura com branco), para o logótipo assentar em qualquer fundo claro sem halo. Os ícones usam só o
símbolo (casa, sol, pessoas e onda), sem as letras, que deixam de se ler abaixo de 64 px.

Uso:
    .venv-imagens/bin/python scripts/imagens/gerar_icones.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
ORIGEM = RAIZ / "assets-originais" / "mulotane" / "marca" / "logotipo-perfil-instagram.png"
PUBLICO = RAIZ / "public"
MARCA = PUBLICO / "images" / "marca"
# Círculo da fotografia de perfil dentro do recorte (centro e raio, em píxeis).
CENTRO, RAIO = (355.5, 355.5), 355.5
# Área do desenho dentro do círculo (x0, y0, x1, y1), com folga, e área só do símbolo.
DESENHO = (54, 162, 654, 551)
SIMBOLO = (70, 170, 652, 551)
# Letras ("Mulotana Lodge") dentro da área do símbolo: tudo o que é cinzento-escuro abaixo da onda, à
# esquerda das pessoas.
LETRAS = (0, 405, 345, 551)


def sem_fundo(rgb: np.ndarray) -> np.ndarray:
    """Branco para transparente: alfa mínimo tal que cor * alfa + branco * (1 - alfa) = píxel."""
    c = rgb.astype(np.float64) / 255.0
    # Ruído de compressão no fundo: o que é quase branco passa a branco.
    c[c.min(axis=2) > 0.93] = 1.0
    alfa = (1.0 - c).max(axis=2)
    cor = np.where(alfa[..., None] > 0, 1.0 - (1.0 - c) / np.maximum(alfa[..., None], 1e-6), 1.0)
    rgba = np.dstack([np.clip(cor, 0, 1), alfa])
    return (rgba * 255 + 0.5).astype(np.uint8)


def carregar() -> np.ndarray:
    rgb = np.asarray(Image.open(ORIGEM).convert("RGB")).copy()
    alto, largo = rgb.shape[:2]
    yy, xx = np.mgrid[0:alto, 0:largo]
    fora = (xx - CENTRO[0]) ** 2 + (yy - CENTRO[1]) ** 2 > (RAIO - 3) ** 2
    rgb[fora] = 255  # fora do círculo fica o fundo da captura: passa a branco
    return rgb


def logotipo(rgb: np.ndarray) -> None:
    x0, y0, x1, y1 = DESENHO
    img = Image.fromarray(sem_fundo(rgb[y0:y1, x0:x1]), "RGBA")
    MARCA.mkdir(parents=True, exist_ok=True)
    for largura in (240, 480):
        altura = round(img.height * largura / img.width)
        r = img.resize((largura, altura), Image.Resampling.LANCZOS)
        r.save(MARCA / f"mulotana-lodge-{largura}.webp", quality=90, method=6)
        r.save(MARCA / f"mulotana-lodge-{largura}.png", optimize=True)
        print(f"mulotana-lodge-{largura}: {largura}x{altura}")


def simbolo(rgb: np.ndarray) -> Image.Image:
    sx0, sy0, sx1, sy1 = SIMBOLO
    corte = rgb[sy0:sy1, sx0:sx1].copy()
    # Apaga as letras: píxeis cinzentos (pouco saturados, incluindo o anti-serrilhado) na zona das letras
    # passam a branco. A onda verde é saturada e fica intacta.
    lx0, ly0, lx1, ly1 = LETRAS
    zona = corte[max(0, ly0 - sy0):ly1 - sy0, max(0, lx0 - sx0):lx1 - sx0]
    z = zona.astype(int)
    escuro = (z.min(axis=2) < 250) & (z.max(axis=2) - z.min(axis=2) < 40)
    zona[escuro] = 255
    return Image.fromarray(sem_fundo(corte), "RGBA")


def icone(simb: Image.Image, lado: int, *, arredondado: bool, margem: float) -> Image.Image:
    """Símbolo centrado num quadrado branco (o logótipo foi desenhado sobre branco)."""
    escala = 8
    tela = lado * escala
    fundo = Image.new("RGBA", (tela, tela), (0, 0, 0, 0))
    mascara = Image.new("L", (tela, tela), 0)
    from PIL import ImageDraw

    ImageDraw.Draw(mascara).rounded_rectangle(
        (0, 0, tela - 1, tela - 1), radius=round(tela * 0.2) if arredondado else 0, fill=255
    )
    fundo.paste((255, 255, 255, 255), (0, 0), mascara)
    util = tela * (1 - 2 * margem)
    f = min(util / simb.width, util / simb.height)
    s = simb.resize((round(simb.width * f), round(simb.height * f)), Image.Resampling.LANCZOS)
    fundo.alpha_composite(s, ((tela - s.width) // 2, (tela - s.height) // 2))
    return fundo.resize((lado, lado), Image.Resampling.LANCZOS)


def main() -> None:
    rgb = carregar()
    logotipo(rgb)
    simb = simbolo(rgb)
    simb.save(MARCA / "simbolo.png", optimize=True)
    pequenos = [icone(simb, 16, arredondado=True, margem=0.02), icone(simb, 32, arredondado=True, margem=0.04)]
    icone(simb, 48, arredondado=True, margem=0.06).save(
        PUBLICO / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=pequenos
    )
    icone(simb, 96, arredondado=True, margem=0.07).save(PUBLICO / "favicon.png", optimize=True)
    # iOS aplica a sua própria máscara: quadrado cheio, sem cantos.
    icone(simb, 180, arredondado=False, margem=0.1).save(PUBLICO / "apple-touch-icon.png", optimize=True)
    icone(simb, 192, arredondado=True, margem=0.08).save(PUBLICO / "icon-192.png", optimize=True)
    icone(simb, 512, arredondado=True, margem=0.08).save(PUBLICO / "icon-512.png", optimize=True)
    # Maskable: fundo a toda a área e o símbolo dentro da zona segura (círculo de 80%).
    icone(simb, 512, arredondado=False, margem=0.2).save(PUBLICO / "icon-maskable-512.png", optimize=True)
    for nome in ["favicon.ico", "favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
                 "icon-maskable-512.png"]:
        print(nome, (PUBLICO / nome).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
