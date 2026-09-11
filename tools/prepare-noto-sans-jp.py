#!/usr/bin/env python3
"""Build the vendored Noto Sans JP statics used by the meishi generator.

Upstream ships Noto Sans JP as a 9.6 MB variable font. opentype.js cannot read
variable fonts or .ttc collections, and three full static weights would put
~17 MB of binary into the repo, so this script instantiates the three weights
the card needs and subsets each to the glyphs Japanese collateral actually uses.

Run only when the character set below changes:
    python3 tools/prepare-noto-sans-jp.py

Requires fontTools and network access. Output is committed; the build does not
need this script or the network.
"""
import subprocess, sys, urllib.request
from pathlib import Path

SRC = "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/google-fonts/NotoSansJP%5Bwght%5D.ttf"
OUT = Path(__file__).resolve().parent.parent / "fonts" / "Noto_Sans_JP"
WEIGHTS = {400: "Regular", 500: "Medium", 700: "Bold"}

# Kanji appearing in askOdin Japanese collateral. Extend when new copy lands.
#
# The meishi set came first. The second block is the Osaka executive brief
# (generate-exec-brief-ja.mjs), which added 260 characters — its
# coverage() collects the whole document and prints the delta in this form,
# rather than failing on the first missing glyph the way the card does.
KANJI = (
    "創業者兼代表取締役陸奕順資本配分判断米国特許出願中件所在地法人株式会社東京大阪営責任担当部長共同最高収益"
    "参画仮事考方沿設計未公開市場説得力適化物理則基概要料財務間論矛盾決定的監査盤毎回指摘項内根拠箇遡投委員前明可能性検証他野標準自身認報告日令規制枠組情横防衛線機関家向破綻対象金融総合商突数値食違提歪以完了付記録急直調達控学発研究型面談致命点洗修正無試英語核構造済依存係現巧除上主張切脆採複文書三角照示黙整時系列並評価乖離確率実行知遮扱結果固再客様類習使抽外有用原保持期限動執仕装供予派生超省経産第版度審込既変更意思段置入観体年築携買初太平洋域技術門統括賞受個別相承過去案進週貴月之島火水木梅田後空白埋通窓口導策形態償削望応"
)

def charset() -> str:
    ranges = [
        (0x0020, 0x007E),  # ASCII
        (0x3040, 0x309F),  # hiragana
        (0x30A0, 0x30FF),  # katakana
        (0xFF01, 0xFF5E),  # fullwidth forms
    ]
    chars = {chr(c) for a, b in ranges for c in range(a, b + 1)}
    chars |= set(KANJI)
    chars |= set("　、。「」・ー〜％℃™©®※§±×÷→←↑↓…‥“”‘’–—·")
    return "".join(sorted(chars))

def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    var = OUT / ".NotoSansJP-variable.ttf"
    if not var.exists():
        print(f"downloading variable source ({SRC.rsplit('/', 1)[-1]}) ...")
        urllib.request.urlretrieve(SRC, var)
    unicodes = ",".join(f"U+{ord(c):04X}" for c in charset())

    for wght, name in WEIGHTS.items():
        dst = OUT / f"NotoSansJP-{name}.ttf"
        subprocess.run([
            sys.executable, "-m", "fontTools.varLib.instancer",
            str(var), f"wght={wght}", "-o", str(dst),
        ], check=True, stdout=subprocess.DEVNULL)
        subprocess.run([
            sys.executable, "-m", "fontTools.subset", str(dst),
            f"--unicodes={unicodes}", "--layout-features=*",
            "--name-IDs=*", "--notdef-outline",
            f"--output-file={dst}",
        ], check=True, stdout=subprocess.DEVNULL)
        print(f"  {dst.name:28s} {dst.stat().st_size / 1024:7.1f} KB  (wght={wght})")

    var.unlink(missing_ok=True)
    print(f"\n{len(charset())} characters subset into {len(WEIGHTS)} weights -> {OUT}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
