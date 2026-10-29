#!/usr/bin/env python3
"""Tratamento técnico das fotografias reais do Mulotana Lodge.

Lê os originais em assets-originais/mulotane/real/ (nunca os altera) e escreve as versões para a web em
public/images/mulotane/real/ (AVIF + WebP, em várias larguras) e a imagem de partilha em public/og/.

Só corrige a técnica: ruído e artefactos de compressão, balanço de brancos parcial, exposição, contraste
ligeiro e nitidez. Não acrescenta, remove nem move nada do que foi fotografado. Os enquadramentos
diferentes de cada secção são feitos no CSS (object-fit/object-position), não em ficheiros novos.

Uso:
    python3 -m venv .venv-imagens && .venv-imagens/bin/pip install -r scripts/imagens/requirements.txt
    .venv-imagens/bin/python scripts/imagens/tratar_fotografias.py
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
ORIGINAIS = RAIZ / "assets-originais" / "mulotane" / "real"
DESTINO = RAIZ / "public" / "images" / "mulotane" / "real"
OG = RAIZ / "public" / "og"
RELATORIO = RAIZ / "src" / "data" / "imagens-geradas.json"
# Lado maior da versão "max": chega para as colunas do layout e mantém o peso baixo em rede móvel.
LADO_MAXIMO = 1280


@dataclass
class Ajustes:
    """Parâmetros moderados por fotografia (valores escolhidos a partir da análise de cada original)."""

    # Força da correcção de balanço de brancos (0 = nenhuma, 1 = neutro total). Fica sempre parcial
    # para não mudar a cor real das paredes, tecidos e mobiliário.
    balanco: float = 0.0
    # Gama aplicado à luminância (< 1 aclara meios-tons e sombras; 1 = sem alteração).
    gama: float = 1.0
    # Intensidade da curva em S (0 = sem alteração).
    contraste: float = 0.0
    # Saturação (1 = sem alteração).
    saturacao: float = 1.0
    # Força da redução de ruído (parâmetro h do NL-means da OpenCV).
    ruido: float = 3.0
    # Larguras a gerar ("max" = largura do original depois do recorte, limitada a LADO_MAXIMO).
    larguras: list[int | str] = field(default_factory=lambda: [640, "max"])
    # Ficheiro de origem em assets-originais/mulotane/real/ (por omissão "<nome>.jpg").
    origem: str = ""
    # Recorte moderado (x0, y0, x1, y1) sobre o original, só para tirar carimbos de data, marcas de
    # câmara ou pessoas no limite do enquadramento. Nunca acrescenta nem move nada.
    recorte: tuple[int, int, int, int] | None = None


FOTOGRAFIAS: dict[str, Ajustes] = {
    # --- Contas oficiais do lodge (Instagram @mulotana_lodge e página de Facebook), recortadas das
    #     capturas de ecrã enviadas pelo responsável a 29/10/2026 (ver assets-originais/mulotane/LEIA-ME.md). São fotografias
    #     já editadas pelo lodge: só ruído de compressão e, nas de 2016, um balanço de brancos ligeiro.
    # Quartos
    "quarto-cadeirao": Ajustes(origem="ig-quarto-cadeirao.png", ruido=2.0),
    "quarto-duas-camas": Ajustes(origem="ig-quarto-duas-camas.png", ruido=2.0),
    "quarto-cama-redonda": Ajustes(origem="ig-quarto-cama-redonda.png", ruido=2.0),
    "quarto-casal": Ajustes(origem="ig-quarto-casal.png", ruido=2.0),
    "quarto-poltronas": Ajustes(origem="ig-quarto-poltronas.png", ruido=2.0),
    "quarto-mosquiteiro": Ajustes(origem="fb-quarto-mosquiteiro.png", balanco=0.15, contraste=0.05, ruido=3.0),
    # Piscinas, jardins e lazer. A da piscina com palmeiras é o hero e a imagem de partilha.
    "piscina-palmeiras": Ajustes(origem="ig-piscina-palmeiras.png", ruido=2.0),
    "piscina-topiaria": Ajustes(origem="ig-piscina-topiaria.png", ruido=2.0),
    "piscina-deck": Ajustes(origem="ig-piscina-deck.png", ruido=2.0),
    "piscina-cascata": Ajustes(origem="ig-piscina-cascata.png", ruido=2.0),
    "piscina-sombra": Ajustes(origem="ig-piscina-sombra.png", ruido=2.0),
    "vista-piscina-esplanada": Ajustes(origem="fb-vista-piscina-esplanada.png", ruido=3.0),
    "esplanada-arvore": Ajustes(origem="fb-esplanada-arvore.png", balanco=0.10, contraste=0.05, ruido=3.0),
    "mesas-sombra": Ajustes(origem="ig-mesas-sombra.png", ruido=2.0),
    "decoracao-quarto": Ajustes(origem="ig-decoracao-quarto.png", ruido=3.0),
    # Conferências e eventos. Recorte do buffet: tira o painel decorativo da festa no limite esquerdo.
    "sala-conferencias-palco": Ajustes(origem="ig-sala-conferencias-palco.png", ruido=2.0),
    "sala-conferencias-plateia": Ajustes(origem="ig-sala-conferencias-plateia.png", ruido=2.0),
    "sala-conferencias-u": Ajustes(origem="ig-sala-conferencias-u.png", ruido=2.0),
    "buffet-evento": Ajustes(origem="fb-buffet-evento.png", recorte=(300, 0, 1080, 810),
                             balanco=0.15, ruido=3.0),
    # Restaurante
    "restaurante-janelas": Ajustes(origem="fb-restaurante-janelas.png", balanco=0.15, gama=0.95,
                                   contraste=0.05, ruido=3.0),
    # Espaços do lodge
    "edificio-colmo": Ajustes(origem="ig-edificio-colmo.png", ruido=2.0),
    "passadico-colmo": Ajustes(origem="ig-passadico-colmo.png", ruido=2.0),
    "edificio-envidracado": Ajustes(origem="fb-edificio-envidracado.png", ruido=3.0),
    "edificio-varandas": Ajustes(origem="fb-edificio-varandas.png", balanco=0.10, contraste=0.05, ruido=3.0),
    "caminho-arvores": Ajustes(origem="fb-caminho-arvores.png", balanco=0.10, ruido=3.0),
    # --- Enviadas pelo cliente (JPEG 900 px). Ajustes limitados a luz, contraste, ruído e nitidez. ---
    "piscina-jardim": Ajustes(balanco=0.15, gama=0.97, contraste=0.10, ruido=3.0),
    # Sala de refeições: contraluz das janelas deixa a sala escura (mediana 68/255).
    "sala-refeicoes": Ajustes(balanco=0.30, gama=0.78, contraste=0.06, ruido=5.0),
    # Buffet (vertical): ligeira dominante magenta nos neutros.
    "restaurante-buffet": Ajustes(balanco=0.30, gama=0.95, contraste=0.06, ruido=4.0),
    # Buffet com vista da sala: neutros um pouco azulados, sombras fechadas.
    "restaurante-buffet-sala": Ajustes(balanco=0.25, gama=0.88, contraste=0.06, ruido=4.0),
    # Quarto com duas camas: as toalhas têm "ALD. TUR. MIXALI-XAU", o nome do aldeamento turístico na
    # placa antiga do lodge (Aldeamento Turístico de Michachau); a mesma inscrição aparece numa fotografia
    # da página de Facebook do lodge (2016). Reposta por decisão do responsável a 29/10/2026.
    "quarto-twin": Ajustes(balanco=0.20, gama=0.95, contraste=0.05, ruido=4.0),
    # --- Capturas do Google Maps (contribuições de visitantes, com crédito; decisão de 28/10/2026). Só as
    #     de 2025 que acrescentam ao que as contas oficiais mostram. Só a área da fotografia. ---
    # Recorte: tira o carimbo "09/23/2025 14:46" no canto inferior.
    "piscina-espreguicadeiras": Ajustes(origem="gm-piscina-espreguicadeiras.png", recorte=(0, 0, 1080, 740),
                                        balanco=0.10, contraste=0.08, ruido=3.0),
    # Recorte: tira uma pessoa em pé no limite direito e o carimbo "09/23/2025 14:41".
    "sala-refeicoes-bar": Ajustes(origem="gm-sala-refeicoes-bar.png", recorte=(0, 0, 950, 740),
                                  balanco=0.15, contraste=0.05, ruido=3.0),
}

# Guardadas em assets-originais mas fora da versão pública (ver docs/VALIDACAO.md):
# - gm-piscina-terraco, gm-piscina-relvado, gm-esplanada-piscina, gm-sala-conferencias: substituídas por
#   fotografias das contas oficiais dos mesmos espaços.
# - gm-placa-entrada e gm-entrada-coberta: a placa nova (Set. 2026) e a faixa da entrada (Set. 2025) dizem
#   "Mulotane Lodge", com outro logótipo; o site usa o nome e o logótipo das redes oficiais (Mulotana
#   Lodge), por decisão do responsável a 29/10/2026.
# - Capturas não recortadas: com pessoas ou matrículas visíveis, com texto sobreposto (histórias), cartazes
#   promocionais, casas de banho (não confirmam casas de banho privativas) e fotografias repetidas.


def luminancia(rgb: np.ndarray) -> np.ndarray:
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def balanco_brancos(rgb: np.ndarray, forca: float) -> np.ndarray:
    """Aproxima dos neutros só os píxeis claros e pouco saturados (paredes, lençóis, tectos)."""
    if forca <= 0:
        return rgb
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / (mx + 1e-6)
    lum = luminancia(rgb)
    neutros = (sat < 0.25) & (lum > 0.45) & (mx < 0.98)
    if neutros.sum() < 500:
        return rgb
    media = rgb[neutros].mean(0)
    ganho = (media.mean() / media) ** forca
    return np.clip(rgb * ganho, 0, 1)


def tom(rgb: np.ndarray, gama: float, contraste: float) -> np.ndarray:
    """Gama e curva em S sobre a luminância, aplicados como razão para preservar a cor."""
    lum = luminancia(rgb)
    nova = np.power(np.clip(lum, 0, 1), gama)
    if contraste > 0:
        s = 0.5 - 0.5 * np.cos(np.pi * nova)  # curva em S suave
        nova = (1 - contraste) * nova + contraste * s
    razao = np.where(lum > 1e-4, nova / np.maximum(lum, 1e-4), 1.0)
    saida = rgb * razao[..., None]
    # Protege as altas luzes: comprime em vez de cortar.
    return saida / np.maximum(saida.max(-1, keepdims=True), 1.0)


def saturacao(rgb: np.ndarray, fator: float) -> np.ndarray:
    if abs(fator - 1) < 1e-3:
        return rgb
    lum = luminancia(rgb)[..., None]
    return np.clip(lum + (rgb - lum) * fator, 0, 1)


def nitidez(img8: np.ndarray, quantidade: float, raio: float) -> np.ndarray:
    desfocada = cv2.GaussianBlur(img8, (0, 0), raio)
    return cv2.addWeighted(img8, 1 + quantidade, desfocada, -quantidade, 0)


def tratar(nome: str, aj: Ajustes) -> tuple[np.ndarray, dict]:
    origem = aj.origem or f"{nome}.jpg"
    original = cv2.cvtColor(cv2.imread(str(ORIGINAIS / origem)), cv2.COLOR_BGR2RGB)
    dimensoes = [int(original.shape[1]), int(original.shape[0])]
    if aj.recorte:
        x0, y0, x1, y1 = aj.recorte
        original = np.ascontiguousarray(original[y0:y1, x0:x1])
    # Redução de ruído e de blocos JPEG; mistura com o original para manter a textura.
    limpa = cv2.fastNlMeansDenoisingColored(original, None, aj.ruido, aj.ruido, 7, 21)
    limpa = cv2.addWeighted(limpa, 0.75, original, 0.25, 0)
    rgb = limpa.astype(np.float32) / 255.0
    rgb = balanco_brancos(rgb, aj.balanco)
    rgb = tom(rgb, aj.gama, aj.contraste)
    rgb = saturacao(rgb, aj.saturacao)
    tratada = (np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)
    antes = luminancia(original.astype(np.float32) / 255.0)
    depois = luminancia(tratada.astype(np.float32) / 255.0)
    info = {
        "original": f"assets-originais/mulotane/real/{origem}",
        "dimensoes_originais": dimensoes,
        "dimensoes_tratadas": [int(tratada.shape[1]), int(tratada.shape[0])],
        "ajustes": {k: v for k, v in aj.__dict__.items() if k != "origem"},
        "luminancia_mediana": {"antes": round(float(np.median(antes)) * 255, 1),
                               "depois": round(float(np.median(depois)) * 255, 1)},
    }
    return tratada, info


def redimensionar(img: np.ndarray, largura: int) -> np.ndarray:
    alto, largo = img.shape[:2]
    if largura == largo:
        return nitidez(img, 0.25, 0.8)
    altura = round(alto * largura / largo)
    interp = cv2.INTER_AREA if largura < largo else cv2.INTER_LANCZOS4
    out = cv2.resize(img, (largura, altura), interpolation=interp)
    if largura > largo:
        return nitidez(out, 0.35, 1.2)  # ampliação: compensa a suavidade da interpolação
    return nitidez(out, 0.25, 0.8)


def gravar(img: np.ndarray, base: Path) -> list[str]:
    pil = Image.fromarray(img)
    pil.save(base.with_suffix(".avif"), quality=50, speed=4)
    pil.save(base.with_suffix(".webp"), quality=74, method=6)
    return [base.with_suffix(".avif").name, base.with_suffix(".webp").name]


def imagem_partilha(img: np.ndarray) -> None:
    """1200x630 para Open Graph/WhatsApp, recortada da fotografia do hero sem alterar o conteúdo."""
    alto, largo = img.shape[:2]
    altura = round(largo * 630 / 1200)
    topo = min(max(0, round((alto - altura) * 0.35)), alto - altura)
    recorte = img[topo:topo + altura, :]
    out = cv2.resize(recorte, (1200, 630), interpolation=cv2.INTER_LANCZOS4)
    out = nitidez(out, 0.35, 1.2)
    OG.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out).save(OG / "mulotana-lodge.jpg", quality=84, optimize=True, progressive=True)


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    for antigo in DESTINO.glob("*.*"):  # o script é a única fonte desta pasta
        antigo.unlink()
    relatorio: dict[str, dict] = {}
    for nome, aj in FOTOGRAFIAS.items():
        tratada, info = tratar(nome, aj)
        ficheiros: list[str] = []
        alto, largo = tratada.shape[:2]
        maxima = min(largo, round(largo * LADO_MAXIMO / max(alto, largo)))
        larguras = sorted({maxima if l == "max" else int(l) for l in aj.larguras})
        for largura in larguras:
            ficheiros += gravar(redimensionar(tratada, largura), DESTINO / f"{nome}-{largura}")
        info["larguras"] = larguras
        info["ficheiros"] = ficheiros
        relatorio[nome] = info
        if nome == "piscina-palmeiras":
            imagem_partilha(tratada)
        print(f"{nome}: {info['luminancia_mediana']} -> {', '.join(ficheiros)}")
    RELATORIO.parent.mkdir(parents=True, exist_ok=True)
    RELATORIO.write_text(json.dumps(relatorio, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
