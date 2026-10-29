#!/usr/bin/env python3
"""Tratamento técnico das fotografias reais do Mulotana Lodge.

Lê os originais em assets-originais/mulotane/real/ (nunca os altera) e escreve as versões para a web em
public/images/mulotane/real/ (AVIF + WebP, em várias larguras) e a imagem de partilha em public/og/.

Acabamento técnico, como numa edição fotográfica profissional: balanço de brancos parcial, níveis, exposição,
contraste global e local, vibração moderada, redução de ruído só onde há ruído e nitidez. Não acrescenta,
remove nem move nada do que foi fotografado e não usa IA generativa. Os enquadramentos diferentes de cada
secção são feitos no CSS (object-fit/object-position), não em ficheiros novos. As fotografias usadas em
grande formato (palcos, aberturas e faixas) ganham uma versão maior (até 1600 px, no máximo 1,6 vezes o
original), ampliada com Lanczos e nitidez: resolução aparente para ecrãs grandes, sem acrescentar conteúdo.

Nitidez (revisão de 29/10/2026, depois de uma medição fotografia a fotografia):
- O ruído é medido nas zonas lisas de cada fotografia. A maioria quase não tem ruído (as das redes já vêm
  comprimidas e alisadas), por isso a redução de ruído só se aplica onde é preciso e com a força medida;
  antes, um valor fixo apagava textura (folhas, tecidos, madeira).
- A nitidez aplica-se só à luminosidade (sem franjas de cor) e com um limiar (não realça ruído nem blocos
  de compressão). As fotografias "suaves" (com pouco pormenor fino de origem) recebem um pouco mais.
- AVIF com qualidade 52 (62 nas fotografias suaves, que ficam pequenas de qualquer forma) e WebP 78/82.

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
    # --- Acabamento profissional (aplicado a todas, com valores moderados por omissão) ---
    # Níveis automáticos: aproxima o preto e o branco da imagem do preto e do branco reais (0 = nenhum).
    niveis: float = 0.6
    # Contraste local (CLAHE na luminosidade, misturado com o original): dá definição sem halos.
    clareza: float = 0.3
    # Vibração: aviva as cores pouco saturadas e quase não mexe nas já saturadas (0 = nenhuma).
    vibracao: float = 0.12
    # Força da redução de ruído (parâmetro h do NL-means da OpenCV). None = medida na própria fotografia.
    ruido: float | None = None
    # Larguras a gerar ("max" = largura do original depois do recorte, limitada a LADO_MAXIMO; "grande" =
    # versão ampliada para grande formato, até 1600 px e no máximo 1,6 vezes o original).
    larguras: list[int | str] = field(default_factory=lambda: [640, "max"])
    # Ficheiro de origem em assets-originais/mulotane/real/ (por omissão "<nome>.jpg").
    origem: str = ""
    # Recorte moderado (x0, y0, x1, y1) sobre o original, só para tirar carimbos de data, marcas de
    # câmara ou pessoas no limite do enquadramento. Nunca acrescenta nem move nada.
    recorte: tuple[int, int, int, int] | None = None


# Fotografias em grande formato (palcos, aberturas e faixas): versão extra ampliada ("grande").
LARGO: list[int | str] = [640, "max", "grande"]
GRANDE_MAXIMO = 1600
GRANDE_FATOR = 1.6
# Qualidade de compressão (Pillow): as fotografias suaves ganham qualidade (o ficheiro continua pequeno).
QUALIDADE_AVIF = {"normal": 52, "suave": 62}
QUALIDADE_WEBP = {"normal": 78, "suave": 82}

FOTOGRAFIAS: dict[str, Ajustes] = {
    # --- Contas oficiais do lodge (Instagram @mulotana_lodge e página de Facebook), recortadas das
    #     capturas de ecrã enviadas pelo responsável a 29/10/2026 (ver assets-originais/mulotane/LEIA-ME.md). São fotografias
    #     já editadas pelo lodge: só ruído de compressão e, nas de 2016, um balanço de brancos ligeiro.
    # Quartos
    "quarto-cadeirao": Ajustes(origem="ig-quarto-cadeirao.png",
                               larguras=LARGO),
    "quarto-duas-camas": Ajustes(origem="ig-quarto-duas-camas.png",
                                  larguras=LARGO),
    "quarto-cama-redonda": Ajustes(origem="ig-quarto-cama-redonda.png",
                                   larguras=LARGO),
    "quarto-casal": Ajustes(origem="ig-quarto-casal.png"),
    "quarto-poltronas": Ajustes(origem="ig-quarto-poltronas.png",
                                 larguras=LARGO),
    "quarto-mosquiteiro": Ajustes(origem="fb-quarto-mosquiteiro.png", balanco=0.15, contraste=0.05),
    # Piscinas, jardins e lazer. A da piscina com palmeiras é o hero e a imagem de partilha.
    "piscina-palmeiras": Ajustes(origem="ig-piscina-palmeiras.png",
                                 larguras=LARGO),
    "piscina-topiaria": Ajustes(origem="ig-piscina-topiaria.png",
                                larguras=LARGO),
    "piscina-deck": Ajustes(origem="ig-piscina-deck.png"),
    "piscina-cascata": Ajustes(origem="ig-piscina-cascata.png",
                                larguras=LARGO),
    "piscina-sombra": Ajustes(origem="ig-piscina-sombra.png"),
    "vista-piscina-esplanada": Ajustes(origem="fb-vista-piscina-esplanada.png",
                                       larguras=LARGO),
    "esplanada-arvore": Ajustes(origem="fb-esplanada-arvore.png", balanco=0.10, contraste=0.05,
                                larguras=LARGO),
    "mesas-sombra": Ajustes(origem="ig-mesas-sombra.png"),
    "decoracao-quarto": Ajustes(origem="ig-decoracao-quarto.png",
                                 larguras=LARGO),
    # Conferências e eventos. Recorte do buffet: tira o painel decorativo da festa no limite esquerdo.
    "sala-conferencias-palco": Ajustes(origem="ig-sala-conferencias-palco.png",
                                       larguras=LARGO),
    "sala-conferencias-plateia": Ajustes(origem="ig-sala-conferencias-plateia.png",
                                         larguras=LARGO),
    "sala-conferencias-u": Ajustes(origem="ig-sala-conferencias-u.png",
                                   larguras=LARGO),
    "buffet-evento": Ajustes(origem="fb-buffet-evento.png", recorte=(300, 0, 1080, 810),
                             balanco=0.15),
    # Restaurante
    "restaurante-janelas": Ajustes(origem="fb-restaurante-janelas.png", balanco=0.15, gama=0.95,
                                   contraste=0.05, larguras=LARGO),
    # Espaços do lodge
    "edificio-colmo": Ajustes(origem="ig-edificio-colmo.png",
                              larguras=LARGO),
    "passadico-colmo": Ajustes(origem="ig-passadico-colmo.png"),
    "edificio-envidracado": Ajustes(origem="fb-edificio-envidracado.png"),
    "edificio-varandas": Ajustes(origem="fb-edificio-varandas.png", balanco=0.10, contraste=0.05),
    "caminho-arvores": Ajustes(origem="fb-caminho-arvores.png", balanco=0.10),
    # --- Enviadas pelo cliente (JPEG 900 px). Ajustes limitados a luz, contraste, ruído e nitidez. ---
    "piscina-jardim": Ajustes(balanco=0.15, gama=0.97, contraste=0.10),
    # Sala de refeições: contraluz das janelas deixa a sala escura (mediana 68/255).
    "sala-refeicoes": Ajustes(balanco=0.30, gama=0.78, contraste=0.06, larguras=LARGO),
    # Buffet (vertical): ligeira dominante magenta nos neutros.
    "restaurante-buffet": Ajustes(balanco=0.30, gama=0.95, contraste=0.06),
    # Buffet com vista da sala: neutros um pouco azulados, sombras fechadas.
    "restaurante-buffet-sala": Ajustes(balanco=0.25, gama=0.88, contraste=0.06),
    # Quarto com duas camas: as toalhas têm "ALD. TUR. MIXALI-XAU", o nome do aldeamento turístico na
    # placa antiga do lodge (Aldeamento Turístico de Michachau); a mesma inscrição aparece numa fotografia
    # da página de Facebook do lodge (2016). Reposta por decisão do responsável a 29/10/2026.
    "quarto-twin": Ajustes(balanco=0.20, gama=0.95, contraste=0.05),
    # --- Capturas do Google Maps (contribuições de visitantes, com crédito; decisão de 28/10/2026). Só as
    #     de 2025 que acrescentam ao que as contas oficiais mostram. Só a área da fotografia. ---
    # Recorte: tira o carimbo "09/23/2025 14:46" no canto inferior.
    "piscina-espreguicadeiras": Ajustes(origem="gm-piscina-espreguicadeiras.png", recorte=(0, 0, 1080, 740),
                                        balanco=0.10, contraste=0.08),
    # Recorte: tira as pessoas junto ao balcão (limite direito) e o carimbo "09/23/2025 14:41".
    "sala-refeicoes-bar": Ajustes(origem="gm-sala-refeicoes-bar.png", recorte=(0, 0, 800, 740),
                                  balanco=0.15, contraste=0.05, larguras=LARGO),
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


def niveis(rgb: np.ndarray, forca: float) -> np.ndarray:
    """Estica a luminância entre os percentis 0,4 e 99,6 (sem cortar), como razão para preservar a cor."""
    if forca <= 0:
        return rgb
    lum = luminancia(rgb)
    baixo, alto = np.percentile(lum, [0.4, 99.6])
    if alto - baixo < 0.2:
        return rgb
    nova = np.clip((lum - baixo) / (alto - baixo) * 0.97 + 0.015, 0, 1)
    nova = (1 - forca) * lum + forca * nova
    razao = np.where(lum > 1e-4, nova / np.maximum(lum, 1e-4), 1.0)
    saida = rgb * razao[..., None]
    return saida / np.maximum(saida.max(-1, keepdims=True), 1.0)


def clareza(rgb: np.ndarray, forca: float) -> np.ndarray:
    """Contraste local: CLAHE no canal L (Lab), misturado com o original para não criar halos."""
    if forca <= 0:
        return rgb
    img8 = (np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)
    lab = cv2.cvtColor(img8, cv2.COLOR_RGB2LAB)
    l_canal = lab[..., 0]
    clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8))
    lab[..., 0] = cv2.addWeighted(clahe.apply(l_canal), forca, l_canal, 1 - forca, 0)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB).astype(np.float32) / 255.0


def vibracao(rgb: np.ndarray, forca: float) -> np.ndarray:
    """Aumenta a saturação na proporção inversa da saturação actual (protege as cores já fortes)."""
    if forca <= 0:
        return rgb
    mx, mn = rgb.max(-1, keepdims=True), rgb.min(-1, keepdims=True)
    sat = (mx - mn) / (mx + 1e-6)
    fator = 1 + forca * (1 - sat)
    lum = luminancia(rgb)[..., None]
    return np.clip(lum + (rgb - lum) * fator, 0, 1)


def nitidez(img8: np.ndarray, quantidade: float, raio: float, limiar: float = 2.0) -> np.ndarray:
    """Máscara de nitidez só na luminosidade (L do Lab): sem franjas de cor. O limiar suave deixa de fora as
    variações pequenas (ruído, blocos de compressão), para só se realçarem contornos e textura reais."""
    lab = cv2.cvtColor(img8, cv2.COLOR_RGB2LAB).astype(np.float32)
    lum = lab[..., 0]
    detalhe = lum - cv2.GaussianBlur(lum, (0, 0), raio)
    detalhe = np.where(np.abs(detalhe) > limiar, detalhe - np.sign(detalhe) * limiar, 0)
    lab[..., 0] = np.clip(lum + quantidade * detalhe, 0, 255)
    return cv2.cvtColor((lab + 0.5).astype(np.uint8), cv2.COLOR_LAB2RGB)


def ruido_medido(img8: np.ndarray) -> float:
    """Desvio-padrão do ruído nas zonas lisas (céu, paredes, lençóis): o resíduo de alta frequência nos 10 %
    de blocos 8x8 com menos textura. A textura (folhas, tecidos) não conta como ruído."""
    cinza = cv2.cvtColor(img8, cv2.COLOR_RGB2GRAY).astype(np.float32)
    residuo = cinza - cv2.GaussianBlur(cinza, (0, 0), 1.2)
    alto, largo = cinza.shape
    b = 8
    corte = (slice(0, alto // b * b), slice(0, largo // b * b))

    def blocos(a: np.ndarray) -> np.ndarray:
        return a[corte].reshape(alto // b, b, largo // b, b).transpose(0, 2, 1, 3).reshape(-1, b * b)

    medias = blocos(cinza).mean(1)
    validos = (medias > 20) & (medias < 235)  # fora dos pretos e dos brancos cortados
    return float(np.percentile(blocos(residuo)[validos].std(1), 10))


def suave(img8: np.ndarray) -> bool:
    """Fotografia com pouco pormenor fino de origem (ex.: quartos e salas das redes sociais, já comprimidos):
    reduzir para 2/3 e voltar a ampliar quase não a altera."""
    cinza = cv2.cvtColor(img8, cv2.COLOR_RGB2GRAY).astype(np.float32)
    alto, largo = cinza.shape

    def perda(k: float) -> float:
        reduzida = cv2.resize(cinza, (round(largo / k), round(alto / k)), interpolation=cv2.INTER_AREA)
        return float(np.mean(np.abs(cinza - cv2.resize(reduzida, (largo, alto), interpolation=cv2.INTER_CUBIC))))

    return perda(1.5) / max(perda(4.0), 1e-6) < 0.3


def tratar(nome: str, aj: Ajustes) -> tuple[np.ndarray, dict]:
    origem = aj.origem or f"{nome}.jpg"
    original = cv2.cvtColor(cv2.imread(str(ORIGINAIS / origem)), cv2.COLOR_BGR2RGB)
    dimensoes = [int(original.shape[1]), int(original.shape[0])]
    if aj.recorte:
        x0, y0, x1, y1 = aj.recorte
        original = np.ascontiguousarray(original[y0:y1, x0:x1])
    rgb = original.astype(np.float32) / 255.0
    rgb = balanco_brancos(rgb, aj.balanco)
    rgb = niveis(rgb, aj.niveis)
    rgb = tom(rgb, aj.gama, aj.contraste)
    rgb = clareza(rgb, aj.clareza)
    rgb = saturacao(rgb, aj.saturacao)
    rgb = vibracao(rgb, aj.vibracao)
    tratada = (np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)
    # Redução de ruído só onde há ruído, medido depois dos ajustes de luz (aclarar sombras levanta-o) e
    # misturada com a imagem para manter a textura. Abaixo de h = 1 não se aplica.
    sigma = ruido_medido(tratada)
    forca = aj.ruido if aj.ruido is not None else min(2.5, 2 * sigma)
    if forca >= 1:
        limpa = cv2.fastNlMeansDenoisingColored(tratada, None, forca, forca, 5, 15)
        tratada = cv2.addWeighted(limpa, 0.6, tratada, 0.4, 0)
    e_suave = suave(original)
    antes = luminancia(original.astype(np.float32) / 255.0)
    depois = luminancia(tratada.astype(np.float32) / 255.0)
    info = {
        "original": f"assets-originais/mulotane/real/{origem}",
        "dimensoes_originais": dimensoes,
        "dimensoes_tratadas": [int(tratada.shape[1]), int(tratada.shape[0])],
        "ajustes": {k: v for k, v in aj.__dict__.items() if k != "origem"},
        "ruido": {"medido": round(sigma, 2), "reducao": round(forca, 2) if forca >= 1 else 0},
        "suave": e_suave,
        "luminancia_mediana": {"antes": round(float(np.median(antes)) * 255, 1),
                               "depois": round(float(np.median(depois)) * 255, 1)},
    }
    return tratada, info


def redimensionar(img: np.ndarray, largura: int, e_suave: bool) -> np.ndarray:
    """Redimensiona (INTER_AREA a reduzir, Lanczos a ampliar) e aplica a nitidez de saída. As fotografias
    suaves e as ampliadas recebem mais, com um raio maior."""
    alto, largo = img.shape[:2]
    extra = 0.15 if e_suave else 0.0
    if largura == largo:
        return nitidez(img, 0.45 + extra, 1.0)
    altura = round(alto * largura / largo)
    interp = cv2.INTER_AREA if largura < largo else cv2.INTER_LANCZOS4
    out = cv2.resize(img, (largura, altura), interpolation=interp)
    if largura > largo:
        return nitidez(out, 0.7 + extra, 1.3)  # ampliação: compensa a suavidade da interpolação
    return nitidez(out, 0.34 + extra / 2, 0.8)


def gravar(img: np.ndarray, base: Path, e_suave: bool) -> list[str]:
    tipo = "suave" if e_suave else "normal"
    pil = Image.fromarray(img)
    pil.save(base.with_suffix(".avif"), quality=QUALIDADE_AVIF[tipo], speed=4)
    pil.save(base.with_suffix(".webp"), quality=QUALIDADE_WEBP[tipo], method=6)
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
        grande = min(GRANDE_MAXIMO, int(largo * GRANDE_FATOR) // 10 * 10)

        def largura_de(l: int | str) -> int:
            return maxima if l == "max" else grande if l == "grande" else int(l)

        larguras = sorted({largura_de(l) for l in aj.larguras})
        for largura in larguras:
            ficheiros += gravar(redimensionar(tratada, largura, info["suave"]), DESTINO / f"{nome}-{largura}",
                                info["suave"])
        info["larguras"] = larguras
        info["ficheiros"] = ficheiros
        relatorio[nome] = info
        if nome == "piscina-palmeiras":
            imagem_partilha(tratada)
        print(f"{nome}: ruído {info['ruido']}, suave={info['suave']} -> {', '.join(ficheiros)}")
    RELATORIO.parent.mkdir(parents=True, exist_ok=True)
    RELATORIO.write_text(json.dumps(relatorio, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
