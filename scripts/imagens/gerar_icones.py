#!/usr/bin/env python3
"""Ícones do site (favicon.ico, PNG e ícones do manifesto) a partir do monograma de public/favicon.svg.

O desenho é o mesmo do SVG (quadrado verde #0B3027 com um "M" dourado #C7A15A de remates finos),
redesenhado aqui com o Pillow em alta resolução e reduzido, para não depender de um renderizador de SVG.
Nos tamanhos pequenos (16 e 32 px) o traço engrossa para continuar legível.

Uso:
    .venv-imagens/bin/python scripts/imagens/gerar_icones.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
PUBLICO = RAIZ / "public"
VERDE = (11, 48, 39, 255)
DOURADO = (199, 161, 90, 255)
ESCALA = 16  # desenha a 64 * 16 = 1024 px e reduz


def monograma(lado: int, *, arredondado: bool, traco: float, margem: float = 0.0) -> Image.Image:
    """Desenha o ícone na grelha 64x64 do SVG. `margem` encolhe o "M" (zona segura dos ícones maskable)."""
    tela = 64 * ESCALA
    img = Image.new("RGBA", (tela, tela), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    raio = 12 * ESCALA if arredondado else 0
    d.rounded_rectangle((0, 0, tela - 1, tela - 1), radius=raio, fill=VERDE)

    fator = 1 - margem

    def p(x: float, y: float) -> tuple[float, float]:
        # Escala à volta do centro (32, 32) e passa para píxeis.
        return ((32 + (x - 32) * fator) * ESCALA, (32 + (y - 32) * fator) * ESCALA)

    largura = round(traco * fator * ESCALA)
    d.line([p(18, 45), p(18, 20), p(32, 37), p(46, 20), p(46, 45)], fill=DOURADO, width=largura, joint="curve")
    remate = round(traco * 0.72 * fator * ESCALA)
    for (x0, y0), (x1, y1) in [((13.5, 45.5), (22.5, 45.5)), ((41.5, 45.5), (50.5, 45.5)),
                               ((15, 18.5), (21, 18.5)), ((43, 18.5), (49, 18.5))]:
        a, b = p(x0, y0), p(x1, y1)
        d.line([a, b], fill=DOURADO, width=remate)
        for cx, cy in (a, b):  # pontas arredondadas, como stroke-linecap="round"
            r = remate / 2
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=DOURADO)
    return img.resize((lado, lado), Image.Resampling.LANCZOS)


def main() -> None:
    pequenos = [monograma(16, arredondado=True, traco=6.0), monograma(32, arredondado=True, traco=4.6)]
    medio = monograma(48, arredondado=True, traco=4.0)
    # O .ico guarda as três resoluções; os browsers escolhem a que precisam.
    medio.save(PUBLICO / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
               append_images=pequenos)
    monograma(96, arredondado=True, traco=3.6).save(PUBLICO / "favicon.png", optimize=True)
    # iOS aplica a sua própria máscara: quadrado cheio, sem cantos.
    monograma(180, arredondado=False, traco=3.5).save(PUBLICO / "apple-touch-icon.png", optimize=True)
    monograma(192, arredondado=True, traco=3.5).save(PUBLICO / "icon-192.png", optimize=True)
    monograma(512, arredondado=True, traco=3.5).save(PUBLICO / "icon-512.png", optimize=True)
    # Maskable: fundo a toda a área e o "M" dentro da zona segura (círculo de 80%).
    monograma(512, arredondado=False, traco=3.5, margem=0.3).save(PUBLICO / "icon-maskable-512.png",
                                                                   optimize=True)
    for nome in ["favicon.ico", "favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
                 "icon-maskable-512.png"]:
        print(nome, (PUBLICO / nome).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
