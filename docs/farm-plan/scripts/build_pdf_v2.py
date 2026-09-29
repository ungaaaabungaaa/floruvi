"""Floruvi farm brief, version 2 (checked model).

Inputs (all in docs/farm-plan/): model/farm_model.py (the checked final model), model/model_output.json,
model/owner_build_final.json (from scripts/owner_build_final.py), research/research_16_topics.json,
research/moulding_research.json and research/systems_research.json. Output: Floruvi-farm-brief-v2.pdf
(override with the FARM_PLAN_PDF environment variable). See docs/farm-plan/README.md.
"""
import json
import os
import re
import sys
from collections import Counter
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
SC = os.path.dirname(HERE)
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(SC, "model"))
import farm_model as m  # noqa: E402  (the checked final model)
import owner_build_final as obf  # noqa: E402

import matplotlib  # noqa: E402
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402

from reportlab.lib import colors  # noqa: E402
from reportlab.lib.enums import TA_RIGHT  # noqa: E402
from reportlab.lib.fonts import addMapping  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import ParagraphStyle  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.pdfbase import pdfmetrics  # noqa: E402
from reportlab.pdfbase.ttfonts import TTFont  # noqa: E402
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, Image, KeepTogether, NextPageTemplate,  # noqa: E402
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)

VERSION = "2"
import tempfile  # noqa: E402
OUT_DIR = tempfile.gettempdir()  # chart image only
OUT = os.environ.get("FARM_PLAN_PDF", os.path.join(SC, "Floruvi-farm-brief-v2.pdf"))

# ------------------------------------------------------------------ fonts, colours, styles
MPL_TTF = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
SUP = "/System/Library/Fonts/Supplemental"
pdfmetrics.registerFont(TTFont("Georgia", os.path.join(SUP, "Georgia.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Bold", os.path.join(SUP, "Georgia Bold.ttf")))
for name, f in (("DV", "DejaVuSans.ttf"), ("DV-B", "DejaVuSans-Bold.ttf"), ("DV-I", "DejaVuSans-Oblique.ttf"),
                ("DV-BI", "DejaVuSans-BoldOblique.ttf")):
    pdfmetrics.registerFont(TTFont(name, os.path.join(MPL_TTF, f)))
addMapping("DV", 0, 0, "DV")
addMapping("DV", 1, 0, "DV-B")
addMapping("DV", 0, 1, "DV-I")
addMapping("DV", 1, 1, "DV-BI")

INK = colors.HexColor("#263f30")
GREEN = colors.HexColor("#294b35")
MUTED = colors.HexColor("#626b5e")
LINE = colors.HexColor("#dcded1")
CREAM = colors.HexColor("#efefe3")
ACCENT = colors.HexColor("#c5cc9b")
LOSS_HEX = "#b3402e"
GAIN_HEX = "#1f7a3a"
BLUE_HEX = "#2a78d6"
GREY_HEX = "#a7ad9f"

W, H = A4
LM = RM = 16 * mm
TM = 15 * mm
BM = 17 * mm
FW = W - LM - RM

S = {
    "title": ParagraphStyle("title", fontName="Georgia", fontSize=23, leading=27, textColor=INK, spaceAfter=3),
    "sub": ParagraphStyle("sub", fontName="DV", fontSize=8.2, leading=11.4, textColor=MUTED, spaceAfter=8),
    "h1": ParagraphStyle("h1", fontName="Georgia", fontSize=14.5, leading=18, textColor=GREEN, spaceBefore=4, spaceAfter=5),
    "h2": ParagraphStyle("h2", fontName="Georgia-Bold", fontSize=10.2, leading=13, textColor=INK, spaceBefore=7, spaceAfter=3),
    "body": ParagraphStyle("body", fontName="DV", fontSize=8.4, leading=11.6, textColor=INK, spaceAfter=4),
    "small": ParagraphStyle("small", fontName="DV", fontSize=7.1, leading=9.4, textColor=MUTED, spaceAfter=3),
    "cell": ParagraphStyle("cell", fontName="DV", fontSize=7.4, leading=9.4, textColor=INK),
    "cellb": ParagraphStyle("cellb", fontName="DV-B", fontSize=7.4, leading=9.4, textColor=INK),
    "cellr": ParagraphStyle("cellr", fontName="DV", fontSize=7.4, leading=9.4, textColor=INK, alignment=TA_RIGHT),
    "cellrb": ParagraphStyle("cellrb", fontName="DV-B", fontSize=7.4, leading=9.4, textColor=INK, alignment=TA_RIGHT),
    "head": ParagraphStyle("head", fontName="DV-B", fontSize=7.1, leading=9, textColor=GREEN),
    "headr": ParagraphStyle("headr", fontName="DV-B", fontSize=7.1, leading=9, textColor=GREEN, alignment=TA_RIGHT),
    "verdict": ParagraphStyle("verdict", fontName="DV", fontSize=8.6, leading=12.1, textColor=INK, spaceAfter=3),
    "src": ParagraphStyle("src", fontName="DV", fontSize=5.9, leading=7.3, textColor=INK),
    "srch": ParagraphStyle("srch", fontName="DV-B", fontSize=6.6, leading=8.6, textColor=GREEN, spaceBefore=4, spaceAfter=1),
}


def indian(n):
    n = int(round(abs(n)))
    s = str(n)
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts) + "," + tail


def inr(x, sign=False):
    neg = x < -0.5
    txt = ("−" if neg else ("+" if sign and x > 0.5 else "")) + "₹" + indian(x)
    return f'<font color="{LOSS_HEX}">{txt}</font>' if neg else txt


def lakh(x, dp=1, sign=False):
    v = x / 1e5
    neg = v < 0
    txt = ("−" if neg else ("+" if sign and v > 0 else "")) + f"₹{abs(v):,.{dp}f} lakh"
    return f'<font color="{LOSS_HEX}">{txt}</font>' if neg else txt


def crore(x, dp=2):
    return f"₹{x / 1e7:,.{dp}f} crore"


def P(text, style="cell"):
    return Paragraph(text, S[style])


def table(rows, widths, header=True, right=(), zebra=True, extra=None):
    data = []
    for i, r in enumerate(rows):
        out = []
        for j, c in enumerate(r):
            if isinstance(c, (Paragraph, Image, Table)):
                out.append(c)
            elif header and i == 0:
                out.append(P(c, "headr" if j in right else "head"))
            else:
                out.append(P(c, "cellr" if j in right else "cell"))
        data.append(out)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
             ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5), ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE)]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), CREAM), ("LINEBELOW", (0, 0), (-1, 0), 0.8, ACCENT)]
    if zebra:
        for i in range(1 if header else 0, len(data)):
            if (i % 2 == 0) == header:
                style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#fbfaf4")))
    if extra:
        style += extra
    t.setStyle(TableStyle(style))
    return t


def box(flowables):
    t = Table([[flowables]], colWidths=[FW])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), CREAM), ("LINEBEFORE", (0, 0), (0, -1), 2.2, GREEN),
                           ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                           ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    return t


def url_of(s):
    mm_ = re.search(r"https?://[^\s,;)\]]+", s)
    return mm_.group(0).rstrip(".") if mm_ else None


def short(u, n=78):
    s = re.sub(r"^https?://(www\.)?", "", u)
    return s if len(s) <= n else s[: n - 1] + "…"


def link(u, text=None, n=90):
    href = u if u.startswith("http") else "https://" + u
    return f'<link href="{escape(href)}" color="#2a5d8f">{escape(text or short(u, n))}</link>'


# ------------------------------------------------------------------ data (checked final model)
MO = json.load(open(os.path.join(SC, "model", "model_output.json")))
OBF = json.load(open(os.path.join(SC, "model", "owner_build_final.json")))
RES = json.load(open(os.path.join(SC, "research", "research_16_topics.json")))
MOULD = json.load(open(os.path.join(SC, "research", "moulding_research.json")))
SYSR = json.load(open(os.path.join(SC, "research", "systems_research.json")))
M40 = m.MONTH_TO_40D
pb = m.P("base")
COMMIT = pb("commitment_inr_per_month")


def G(opt, N, scen="base"):
    for r in OBF:
        if r["option"] == opt and r["towers"] == N and r["scenario"] == scen:
            return r
    raise KeyError((opt, N, scen))


def V(opt, N, view, scen="base"):
    return G(opt, N, scen)["views"][view]["ebitda"]


KIT200, OWN200, B17_200, DWC150, DWC200, KIT600, OWN600 = (G("kit10k", 200), G("own3k", 200), G("bought17k", 200), G("dwc", 150),
                                                            G("dwc", 200), G("kit10k", 600), G("own3k", 600))
KN = {k["label"]: k for k in MO["key_numbers"]}
REC = MO["cashflow_months"]["recommended"]
ANS = REC["answers"]
CHECKS = {c["figure"]: c for c in MO["owner_cost_checks"]}
STEPS = MO["scale_plan_test"]["steps"]
PHASES = MO["realistic_scale_path"]["phases"]
CROPS = MO["crop_table"]
PAINS = MO["pain_points"]

GRID = [50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600]
G_DWC = [V("dwc", N, "legal_lean") for N in GRID]
G_OWN = [V("own3k", N, "legal_lean") for N in GRID]
G_YOURS = [V("kit10k", N, "owner") for N in GRID]


def dscr(e, emi_):
    return e / emi_ if emi_ else None


# ------------------------------------------------------------------ chart
def make_chart(path):
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 7.5, "axes.edgecolor": "#b9bdb0",
                         "axes.labelcolor": "#263f30", "xtick.color": "#626b5e", "ytick.color": "#626b5e"})
    fig, ax = plt.subplots(figsize=(7.0, 2.7), dpi=220)
    k = lambda v: [x / 1e5 for x in v]  # noqa: E731
    ax.axhline(0, color="#8c9486", lw=0.9, zorder=1)
    h3, = ax.plot(GRID, k(G_YOURS), color=GREY_HEX, lw=1.6, marker="o", ms=3.2, mec="white", mew=0.8, zorder=2,
                  label="Towers, your cost figures")
    h2, = ax.plot(GRID, k(G_OWN), color=BLUE_HEX, lw=1.6, marker="o", ms=3.2, mec="white", mew=0.8, zorder=3,
                  label="Your own towers, legal costs (caretaker covers nights)")
    h1, = ax.plot(GRID, k(G_DWC), color=GAIN_HEX, lw=1.9, marker="o", ms=3.6, mec="white", mew=0.8, zorder=4,
                  label="Raft beds (DWC), legal costs (caretaker covers nights), estimate")
    i = GRID.index(150)
    ax.annotate(f"150 units: +₹{G_DWC[i]/1e5:.2f}L a month", (150, G_DWC[i] / 1e5), xytext=(-6, 10),
                textcoords="offset points", ha="right", fontsize=7, color="#263f30")
    ax.set_xlim(44, 640)
    ax.set_xticks([50, 100, 150, 200, 300, 400, 500, 600])
    ax.set_xlabel("Size in 90-plant units (towers or bed units)")
    ax.set_ylabel("Cash profit a month")
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: ("−" if v < 0 else "") + f"₹{abs(v):.0f}L" if v else "₹0"))
    ax.grid(axis="y", color="#e4e6dc", lw=0.6)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.legend(handles=[h1, h2, h3], loc="lower left", frameon=False, fontsize=6.8, handlelength=1.8)
    fig.tight_layout(pad=0.4)
    fig.savefig(path, dpi=220)
    plt.close(fig)


CHART = os.path.join(OUT_DIR, "profit_by_size_v2.png")
make_chart(CHART)


def on_page(canv, doc):
    canv.saveState()
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.5)
    canv.line(LM, BM - 6 * mm, W - RM, BM - 6 * mm)
    canv.setFont("DV", 6.8)
    canv.setFillColor(MUTED)
    canv.drawString(LM, BM - 10 * mm, "Floruvi farm plan, Bengaluru  ·  Feasibility brief, version 2 (checked model)  ·  29 September 2026")
    canv.drawRightString(W - RM, BM - 10 * mm, f"Page {doc.page}")
    canv.restoreState()


doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
                      title="Floruvi farm plan - feasibility brief v2", author="Floruvi (prepared with Claude)",
                      subject="Hydroponic farm feasibility, Bengaluru")
main = Frame(LM, BM, FW, H - TM - BM, id="main", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
gap = 6 * mm
colw = (FW - gap) / 2
doc.addPageTemplates([PageTemplate(id="main", frames=[main], onPage=on_page),
                      PageTemplate(id="twocol", frames=[Frame(LM, BM, colw, H - TM - BM, id="c1", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0),
                                                        Frame(LM + colw + gap, BM, colw, H - TM - BM, id="c2", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)],
                                   onPage=on_page)])
st = []
A = st.append

# ================================================================= PAGE 1
d150 = DWC150["views"]
A(Paragraph("Floruvi farm plan, Bengaluru", S["title"]))
A(Paragraph("Feasibility brief · version 2 · 29 September 2026. Checked: 16 research agents, one model, two independent reviewers "
            "and a final fix-and-rebuild agent; the model reruns with all self-checks passing. Your ₹3,000 tower plan, shared pumps "
            "and raft beds come from two more research agents (724 unique sources in all).", S["sub"]))
A(box([
    Paragraph("<b>The answer</b>", S["verdict"]),
    Paragraph("<b>Do not build 200 towers now, and drop 6,000 towers by March 2027.</b> 200 towers cost "
              f"{lakh(KIT200['capex'])}; you can safely spend about ₹12.6 lakh. With your own cost figures they make "
              f"{inr(V('kit10k', 200, 'owner'), True)} a month, but the loan payment would be {inr(KIT200['emi'])}.", S["verdict"]),
    Paragraph(f"<b>At legal wages and real water and power bills, towers lose money at every size</b> (200 towers "
              f"{inr(V('kit10k', 200, 'legal'))} a month). Your ₹10,000 guard and ₹15,000 7-day caretaker are below the legal minimum.", S["verdict"]),
    Paragraph(f"<b>Your ₹3,000 tower:</b> the plastic can cost that, but moulds cost ₹12.4–26 lakh. At 200 towers your own towers cost "
              f"the same as kits ({lakh(OWN200['capex'])}); they save money above about 600.", S["verdict"]),
    Paragraph(f"<b>Best option found: raft beds (DWC).</b> 150 bed units (13,500 plants) cost about {lakh(DWC150['capex'])} and make "
              f"about {inr(d150['legal']['ebitda'], True)} a month at legal costs ({inr(d150['legal']['ebitda'] * M40, True)} per 40 days), "
              f"which covers a {inr(DWC150['emi'])} loan payment 1.4 times. This is an estimate: pilot it first.", S["verdict"]),
    Paragraph(f"<b>No cash profit by December 2026.</b> The recommended start (microgreens, trading greens and a small test, about ₹10 lakh) "
              f"loses about {inr(-ANS['oct_dec_2026_ebitda_before_commitment_inr'])} in Oct–Dec, makes its first profit in February 2027, "
              "and covers your ₹40,000 payment from September 2027.", S["verdict"]),
]))
A(Spacer(1, 6))
A(Paragraph("Key numbers (base case, checked model)", S["h2"]))
kn = [["Metric", "Value"],
      ["Build cost, 200 units: your ₹17,000 towers / kits / your own towers / raft beds",
       f"{lakh(B17_200['capex'])} / {lakh(KIT200['capex'])} / {lakh(OWN200['capex'])} / {lakh(DWC200['capex'])}"],
      ["Profit a month, 200 towers: your figures / legal minimum / research costs",
       f"{inr(V('kit10k', 200, 'owner'), True)} / {inr(V('kit10k', 200, 'legal'))} / {inr(V('kit10k', 200, 'research'))}"],
      ["Profit per 40 days, 200 towers, your figures", inr(V("kit10k", 200, "owner") * M40, True)],
      ["Raft beds, 150 units: profit at legal costs / loan payment", f"{inr(d150['legal']['ebitda'], True)} / {inr(DWC150['emi'])} (cover 1.38)"],
      ["Break-even at your figures", "about 151 towers; no size breaks even at legal or research costs"],
      ["Legal floors (Karnataka agriculture schedule)", "12-hour night guard ₹32,998 a month; 7-day resident caretaker ₹18,699"],
      ["Your figures hold up to", "helpers 138 towers · power 79 (151 with shared pumps) · water 51 (30 in April)"],
      ["What buyers take from a new seller at good prices", "95 kg a week by month 3; 400 kg a week by month 12"],
      ["First harvest", "a 10-unit test ordered on 11 Oct: 2 Dec 2026 · 200 towers: 2 Jan 2027"]]
A(table(kn, [FW * 0.50, FW * 0.50]))
A(Paragraph("<b>Cost views.</b> <i>Your figures</i>: guard ₹10,000, helpers ₹40,000, water ₹10,000, power ₹10,000, caretaker ₹15,000; repairs, "
            "grower, accounting, insurance and marketing ₹0; items you did not mention at research values. <i>Legal minimum</i>: your plan at the "
            "agriculture minimum wage, a legal night post above 150 units, real power and water bills, repairs from month 7, insurance with a loan. "
            "<i>Caretaker covers nights</i>: the same, but no separate guard up to 200 units. <i>Research costs</i>: a paid grower and an agency guard "
            "above 150 units. Profit = cash profit before loan payments and tax, at month-12 demand (late 2027 at the earliest). Loans: AIF about 6%, "
            "72 months after a 12-month moratorium; own cash for build ₹12.6 lakh. Raft beds are estimates (140 g heads, 25% less labour).", S["small"]))

# ================================================================= PAGE 2: scorecard
A(PageBreak())
A(Paragraph("Scorecard: will this work?", S["h1"]))
A(Paragraph("Why it can work", S["h2"]))
wk = [["Metric", "Value", "Source"],
      ["Raft beds carry their own loan at legal costs", f"150 units: {inr(d150['legal']['ebitda'], True)} a month against a {inr(DWC150['emi'])} EMI", "Checked model + systems research (estimate)"],
      ["Heavier heads, power-cut tolerance", "Raft beds about 140 g against 90 g in towers; 12–72 h before damage against 30–60 minutes", "Touliatos 2016; systems research"],
      ["Top crops earn money per tower", "Arugula ₹1,182, Lollo Rosso ₹768 a month after seeds, packs, delivery and waste", "Checked model, Hyperpure prices"],
      ["Your figures pass break-even", "About 151 towers at your cost figures", "Checked model"],
      ["Shared pumps cut power", "10 towers per 1,000 L tank: 10.5 W per tower instead of 20 W", "Systems research"],
      ["Mild climate, owned land", "Nov–Feb ideal; owned land fits about 1,596 towers or 150–200 bed units with room to spare", "IMD; checked model"],
      ["Real demand", "About 400 kg a week at good prices by month 12", "Demand research"],
      ["Fast side-line cash", "Microgreens and trading greens pay in 2–3 weeks; steady about ₹13,801 a month", "Checked model"],
      ["Cheap long-term loans", "AIF: about 6%, up to ₹2 crore, a 12-month moratorium, no collateral", "AIF guidelines"]]
A(table(wk, [FW * 0.25, FW * 0.53, FW * 0.22]))
A(Paragraph("Why it may not work", S["h2"]))
nw = [["Metric", "Value", "Source"],
      ["Capital", f"200 towers {lakh(KIT200['capex'])} against ₹12.6 lakh safe to spend", "Checked model"],
      ["Loan payment larger than profit", f"200 towers: EMI {inr(KIT200['emi'])} against {inr(V('kit10k', 200, 'owner'))} profit at your figures", "Checked model"],
      ["Legal costs", f"Towers lose money at every size at legal costs (200 towers {inr(V('kit10k', 200, 'legal'))} a month)", "Checked model; reviewers"],
      ["Wages below the law", "₹10,000 guard and ₹15,000 7-day caretaker; a court case may raise farm wages 42%", "Labour research"],
      ["Moulds and plastic", "₹12.4–26 lakh of moulds; PP up 70% in 2026 (₹90.7 → ₹154.7/kg)", "Moulding research; IOCL"],
      ["Buyers are the limit", "600 towers sell 62% at good prices; 6,000 towers 5%", "Checked model"],
      ["Yield risk", "Tower trials give 53–95 g a head; 20% less yield cuts 150-tower profit by about ₹25,900 a month", "Checked model"],
      ["Water and power", "No borewell; tankers ₹2,000–2,850 a load in Feb–May; about 15 outage hours a month", "Water and power research"],
      ["Strong competitors, big failures", "Hyperpure lettuce ₹140–216/kg; Deep Rooted lost ₹52 crore and shut (2025)", "Price and demand research"]]
A(table(nw, [FW * 0.25, FW * 0.53, FW * 0.22]))
A(CondPageBreak(110 * mm))
imp_h = Paragraph("How to make it a successful business", S["h2"])
imp = [["Action", "Effect", "When"],
       ["Pilot raft beds beside one 10-tower cluster (your 5 towers + 5) before buying more towers or moulds",
        f"Raft beds at 150 units: {inr(d150['legal']['ebitda'] - V('own3k', 150, 'legal'), True)} a month more than own towers at legal costs (estimate)", "Oct 2026"],
       ["Use one legal resident caretaker with CCTV and a siren up to 150–200 units", "About ₹20,784 a month, less than your ₹25,000 for guard + caretaker, and legal", "Now"],
       ["Sell before you grow: signed weekly orders; grow only after 4 weeks at 70%+ sold at good prices", "Protects price and sell-through; 600 towers sell only 62% well", "Now"],
       ["Raise measured contribution to about ₹1,300 per tower a month before any tower loan", "The base is ₹637; needs prices and yields about 30% higher, shared pumps and roof rain", "By Mar 2027"],
       ["Keep the ₹99 delivery fee; sell boxes of ₹400–500 on fixed routes", "Dropping the fee cuts 200-tower profit by about ₹59,100 a month", "Now"],
       ["Shared pumps: 10 towers per 1,000 L tank, standby pump, float and SMS alarm", "Half the pump power; power budget stretches to about 151 towers", "With the pilot"],
       ["No moulds for the first 200 towers; then mould only the ring in India, with 3 Indian and 2 Chinese written quotes", "Saves ₹12.4–26 lakh until volume justifies it", "After the pilot"],
       ["Search IP India designs and patents before tooling", "Avoids a claim of up to ₹50,000 per design, or damages and an injunction", "Before moulds"],
       ["Test the water; build roof-rain storage; apply for a borewell permit or Cauvery", "Without RO, ₹10,000 of water covers about 102 towers instead of 51", "Oct 2026"],
       ["Borrow only when measured results give 1.3× debt cover", "Raft beds at 150 units: cover about 1.38 (estimate)", "2027"]]
A(KeepTogether([imp_h, table(imp, [FW * 0.43, FW * 0.44, FW * 0.13])]))

# ================================================================= PAGE 3: profit views
A(CondPageBreak(120 * mm))
A(Paragraph("Profit in four cost views (a month, base case)", S["h1"]))
rows = [["Option", "Build cost", "Your figures", "Legal minimum", "Caretaker covers nights", "Research", "Loan payment"]]
for lab, r in (("200 kit towers", KIT200), ("200 of your ₹17,000 towers", B17_200), ("200 of your own towers (₹3,000 + moulds)", OWN200),
               ("150 raft-bed units (estimate)", DWC150), ("200 raft-bed units (estimate)", DWC200), ("600 kit towers", KIT600)):
    v = r["views"]
    rows.append([lab, lakh(r["capex"]) if r["capex"] < 1e7 else crore(r["capex"]), inr(v["owner"]["ebitda"], True), inr(v["legal"]["ebitda"], True),
                 inr(v["legal_lean"]["ebitda"], True), inr(v["research"]["ebitda"], True), inr(r["emi"])])
A(table(rows, [FW * 0.27, FW * 0.12, FW * 0.12, FW * 0.12, FW * 0.13, FW * 0.12, FW * 0.12], right=(1, 2, 3, 4, 5, 6)))
A(Paragraph(f"Per 40 days: 200 towers at your figures {inr(V('kit10k', 200, 'owner') * M40, True)}; 150 raft-bed units at legal costs "
            f"{inr(d150['legal']['ebitda'] * M40, True)}. After your ₹40,000 payment (until Aug 2027): 200 towers at your figures "
            f"{inr(V('kit10k', 200, 'owner') - COMMIT)}. Range at your figures for 200 towers: {inr(V('kit10k', 200, 'owner', 'conservative'))} to "
            f"{inr(V('kit10k', 200, 'owner', 'optimistic'), True)}; raft beds 150 units at legal costs {inr(V('dwc', 200, 'legal', 'conservative'))} "
            f"to {inr(V('dwc', 200, 'legal', 'optimistic'), True)} (200 units shown for the range). Loan rule: loan = build cost − ₹12.6 lakh own cash "
            "(at most 90%).", S["small"]))
ch_h = Paragraph("Where your cost figures hold, and where they break (checked model)", S["h2"])
ch = [["Your figure", "Holds up to", "Research and the law"]]
LBL = {"Night security guard": "Night guard ₹10,000", "Resident caretaker": "Caretaker ₹15,000 (7 days)", "Helpers and packers": "Helpers ₹40,000",
       "Water (tanker, no borewell)": "Water ₹10,000", "Power": "Power ₹10,000", "Repairs": "Repairs ₹0", "Trained grower (owner grows)": "Grower ₹0 (you)",
       "Insurance": "Insurance ₹0", "Accounting (AI agent)": "Accounting ₹0 (AI)", "Marketing (AI agent)": "Marketing ₹0 (AI)"}
HOLDS = {"Night security guard": "Never legal", "Resident caretaker": "Never legal for 7 days", "Helpers and packers": "138 towers (185 at farm wage)",
         "Water (tanker, no borewell)": "51 towers (102 without RO; 30 in April)", "Power": "79 towers (151 with shared pumps)",
         "Repairs": "First 6 months", "Trained grower (owner grows)": "150 towers (200 with written procedures)", "Insurance": "Not with a loan",
         "Accounting (AI agent)": "Books yes; fees no", "Marketing (AI agent)": "Content yes; samples no"}
SAYS = {"Night security guard": "Legal 12-hour post at least ₹32,998 a month; agency ₹72,330. Up to 150–200 units, one legal caretaker with CCTV and a siren",
        "Resident caretaker": "Legal floor ₹18,699 (agriculture rate) or ₹26,612 (uniform rate); ₹15,000 is legal only for 6 days × 8 hours",
        "Helpers and packers": "Labour is 49 hours per 1,000 plants per 40 days (40% more in the first two cycles); 200 towers need about ₹66,275",
        "Water (tanker, no borewell)": "200 towers need about ₹41,229 a month; hot months up to 1.5–2×",
        "Power": "200 towers about ₹23,368 a month at LT-5 (about ₹6.1 a unit)",
        "Repairs": "About ₹15,594 a month at 200 towers from month 7 (pumps, timers, net cups, film)",
        "Trained grower (owner grows)": "A paid grower about ₹37,416 a month above 150 towers",
        "Insurance": "About ₹1,899 a month at 200 towers; lenders require it",
        "Accounting (AI agent)": "FSSAI licence ₹7,500 a year; a CA for loans",
        "Marketing (AI agent)": "Samples, tastings and trips: about ₹9,000 a month at 200 towers"}
for key in ("Night security guard", "Resident caretaker", "Helpers and packers", "Water (tanker, no borewell)", "Power", "Repairs",
            "Trained grower (owner grows)", "Insurance", "Accounting (AI agent)", "Marketing (AI agent)"):
    if key in CHECKS:
        ch.append([LBL[key], HOLDS[key], SAYS[key]])
A(KeepTogether([ch_h, table(ch, [FW * 0.19, FW * 0.22, FW * 0.59])]))

# ================================================================= PAGE 4: build it cheaper
A(CondPageBreak(150 * mm))
A(Paragraph("Build it cheaper: your ₹3,000 tower", S["h1"]))
A(Paragraph("Your 5 towers cost ₹17,000 each delivered, each with its own pump. You plan to copy them in plastic (about 6 parts: "
            "net cup, ring panel, seed holder, basin). The research priced the plastic, the moulds and the other parts.", S["body"]))
mk = [["Item", "Value (low / base / high)"],
      ["Plastic per 88-site tower", "5.5 / 8.1 / 11.4 kg → moulded parts ₹720 / 1,630 / 2,790 before GST"],
      ["PP price, IOCL Bangalore (before GST)", "₹90.7/kg on 1 Jan 2026 → ₹154.7/kg on 16 Sep 2026"],
      ["Indian steel (P20) moulds", "net cup ₹1.2 lakh · ring ₹4 / 8 / 15 lakh · basin ₹3 / 6 / 10 lakh (600–800 t press) · full set ₹9.5 / 19 / 34 lakh; 4–12 weeks"],
      ["Chinese moulds", "USD 15,000 / 27,000 / 46,000 for the set, plus sea freight and duty"],
      ["Aluminium moulds", "About 10,000 shots: enough for about 600 towers"],
      ["Your own machines", "80–160 t ₹6–18.5 lakh; 450 t new ₹52 lakh; worth it only at 20,000–37,000 towers a year"],
      ["Design work", "Freelancers ₹500–2,000+/hour; Bengaluru agency ₹3,500–4,500/hour; about 60–160 hours; IP search ₹15,000–30,000"],
      ["Costs the ₹3,000 leaves out", "Net cups ₹176–396, pipe ₹120–350, pump/timer/tank share ₹450–2,000, assembly, freight, 2–8% rejects, 18% GST"]]
A(table(mk, [FW * 0.30, FW * 0.70]))
A(Paragraph("Complete cost per tower by route (base, GST included; moulds spread over the volume)", S["h2"]))
NAMES = {"a": "India steel moulds, all parts", "a2": "India aluminium moulds", "b": "China moulds, moulded in India", "c": "China parts imported",
         "d": "Rotomoulded basin + thermoformed rings", "e": "Ready kits + GST", "f": "DIY PVC towers", "g": "Ring mould only (buy tub, cups)",
         "g2": "Ring mould only + shared cluster tank"}
rr = [["Route", "50", "200", "600", "6,000"]]
for t in MOULD["per_tower_cost_by_route_and_volume"]["table"]:
    vals = []
    for vol in ("50", "200", "600", "6000"):
        c = t.get(vol, {}).get("complete_inr")
        vals.append(inr(c[1]) if c else "–")
    rr.append([NAMES.get(t["route"], t["route_name"])] + vals)
A(table(rr, [FW * 0.40, FW * 0.15, FW * 0.15, FW * 0.15, FW * 0.15], right=(1, 2, 3, 4)))
A(Paragraph("Cheapest: DIY PVC at 50–600 towers; for your own design, rotomoulding at 50–200 and aluminium or ring-only moulds at 600; "
            "Indian injection moulding only near 6,000. The ₹3,000 body is realistic from about 2,200 towers (ring-only) or 7,900 (full steel set); "
            "from about 350 if plastic falls back near ₹100/kg. Tooling with GST and development: ring only ₹12.4 lakh, full steel ₹26 lakh, "
            "aluminium ₹13.7 lakh, China landed about ₹40 lakh, thermoforming plus rotomoulding ₹6.8 lakh.", S["small"]))
A(Paragraph("<b>Advice:</b> build no moulds for the first 200 towers. Tie plastic prices in any contract to the IOCL list. Do not buy machines. "
            "Search IP India designs and patents (or pay a patent agent) before tooling.", S["body"]))

# ================================================================= PAGE 5: pumps and systems
A(CondPageBreak(150 * mm))
A(Paragraph("Shared pumps, and a better system than towers", S["h1"]))
cl = [["Towers per tank", "Pump power per tower", "kWh per tower a month", "Tank", "Capex per tower", "Plants at risk if it fails"]]
for c in SYSR["cluster_options"]:
    cap = c.get("capex_per_tower_no_backup_Rs")
    capb = cap[1] if isinstance(cap, list) else cap
    cl.append([str(c["towers_per_reservoir"]), f"{c['W_per_tower_AC']:.1f} W", f"{c['kWh_per_tower_month_67pct']:.1f}", f"{c['reservoir_L']:,.0f} L",
               inr(capb) if isinstance(capb, (int, float)) else "kit", f"{c['plants_lost_if_one_cluster_fails']:,}"])
A(table(cl, [FW * 0.14, FW * 0.17, FW * 0.17, FW * 0.14, FW * 0.17, FW * 0.21], right=(1, 2, 3, 4, 5)))
A(Paragraph("Recommended: 10 towers per buried or insulated 1,000 L tank; one 105 W pump plus a standby pump; a flow switch, two floats, a "
            "cyclic timer and an SMS alarm; one inverter for two clusters. Plant and clear each cluster all at once. Keep the solution at or "
            "below 25–26 °C. Skip UV sterilisers. Use hydrogen peroxide only for cleaning.", S["small"]))
A(Paragraph("Towers against other systems (lettuce)", S["h2"]))
sy = [["System", "Equipment ₹ per plant", "Head weight", "Survives a power cut for", "Core ₹/kg", "All-in ₹/kg"]]
LABEL = [("Vertical towers, bought kit", "Towers, bought kit, pump each"), ("Vertical towers, owner-made", "Towers, your ₹3,000 body, 10-tower cluster"),
         ("NFT flat", "NFT flat channels"), ("DWC float", "Raft beds (DWC), aerated"), ("Kratky", "Kratky tanks, no pump (trial)")]
for srow in SYSR["system_comparison"]:
    lab = next((l2 for pre, l2 in LABEL if srow["system"].startswith(pre)), None)
    if not lab:
        continue
    pc_ = srow["power_cut_tolerance_h_before_damage"]
    pct = "no power needed" if isinstance(pc_.get("base"), str) else f"{pc_['low']}–{pc_['high']} h"
    sy.append([lab, f"₹{srow['capex_per_site_Rs']['base']:.0f}", f"{srow['lettuce_head_g']['base']} g", pct,
               f"₹{srow['cost_Rs_per_sellable_kg_core_capex5y_power_labour']['base']:.0f}", f"₹{srow['cost_Rs_per_kg_all_in_plus_inputs_polyhouse_water']['base']:.0f}"])
A(table(sy, [FW * 0.30, FW * 0.14, FW * 0.12, FW * 0.18, FW * 0.12, FW * 0.14], right=(1, 2, 4, 5)))
A(Paragraph("Core = equipment over 5 years + power + labour per sellable kg; all-in adds seeds, nutrients, polyhouse and RO water. Raft-bed "
            "power-cut hours and most labour hours are estimates.", S["small"]))
A(Paragraph(f"<b>Recommendation.</b> Build new capacity as aerated raft beds (1.2 m wide, 25–30 cm deep, one solution per bed, one 100 W air "
            f"pump per about 70 m² plus a spare, on an inverter), but only after a pilot: 4–6 beds (about 2,000 plants) beside one 10-tower "
            f"cluster, for 2–3 crops. If the beds reach about 140 g heads, 150 bed units need about {DWC150['area_m2']:,.0f} m² under cover and "
            f"{lakh(DWC150['capex'])}. Trial one Kratky bed as a no-power backup. The first fill needs about 250 L of RO water per m² of bed; "
            "beds need mosquito control and a level floor.", S["body"]))

# ================================================================= PAGE 6: scale test + chart + path
A(CondPageBreak(130 * mm))
A(Paragraph("Can 200 towers become 6,000 in 6 months? No.", S["h1"]))
sc = [["Step", "Build cost", "Loan", "Your figures: profit − ₹40,000 − EMI", "Covered area", "Power", "Staff", "Tankers a day", "Sold well", "First check that fails"]]
for s_ in STEPS:
    ln = s_["loan"]
    sc.append([escape(s_["step"].split(":")[1].strip() if ":" in s_["step"] else s_["step"]), lakh(s_["capex_inr"]) if s_["capex_inr"] < 1e7 else crore(s_["capex_inr"]),
               lakh(ln["loan_inr"]) if ln["loan_inr"] < 1e7 else crore(ln["loan_inr"]),
               inr(s_["ebitda_minus_commitment_minus_emi_inr_per_month"]["owner"]), f"{s_['covered_area_m2']:,.0f} m²",
               f"{s_['connected_kw']:,.0f} kW", f"{s_['fte_required']:,.0f}", f"{s_['tanker_loads_per_day']:.1f}",
               f"{s_['share_sold_at_target_price_m12']:.0%}", escape(s_.get("first_failed_check") or "–")])
A(table(sc, [FW * 0.16, FW * 0.10, FW * 0.10, FW * 0.13, FW * 0.09, FW * 0.08, FW * 0.08, FW * 0.08, FW * 0.08, FW * 0.10], right=(1, 2, 3, 4, 5, 6, 7, 8)))
A(Paragraph("Capital breaks first, then the loan payment, then buyers (about 310 kg a week by March 2027, the output of about 278 towers), the "
            "₹2 crore AIF cap, land (owned land holds about 1,596 towers), water, power, hiring and build time.", S["small"]))
A(KeepTogether([Paragraph("Cash profit a month by size (base case)", S["h2"]), Image(CHART, width=FW, height=FW * 2.7 / 7.0),
                 Paragraph("Raft beds peak near 150–200 bed units, where their harvest meets month-12 demand. Towers at legal costs stay below zero.", S["small"])]))
path_h = Paragraph("The fastest realistic path (gated)", S["h2"])
path = [["When", "What", "Go to the next step only when"],
        ["Oct–Dec 2026", "Microgreens 50 trays a week (100 after Gate A), trading greens through Floruvi, a 10-unit test: your 5 towers + 5 in a shared "
         "tank, and 4–6 raft beds beside them. LT-5 power, FSSAI, GST, water tests, rain storage. About ₹10 lakh.",
         "Gate A (end Dec): 10+ paying accounts; 60–95 kg a week sold at good prices for 4 weeks; microgreens at ₹700/kg or more"],
        ["Jan–Mar 2027", "Two or three test cycles. Weigh every harvest; log hours, kWh, water and losses.",
         "Gate B (end Mar): 80 g+ per tower site or 140 g in beds; losses 15% or less; 70%+ sold well; about ₹1,300 per unit a month"],
        ["Oct 2027", f"150 units with an AIF loan: raft beds if they win the test ({lakh(DWC150['capex'])}; EMI {inr(DWC150['emi'])}), "
         "otherwise towers (₹40.3 lakh; EMI ₹50,657).", "12 months of profit at 1.3× debt cover"],
        ["2028–31", "300 units only with higher measured margins or signed bulk contracts; later up to about 1,500 on owned land.", "Signed demand for the extra output"],
        ["Later", "6,000 towers is a different business: a 10-year lease on 3.5–4 acres, HT power, 80–120 staff, 7–8 t a week of contracts, ₹13–15 crore.",
         "2 years of audited profit at 1,000+ units"]]
A(KeepTogether([path_h, table(path, [FW * 0.12, FW * 0.52, FW * 0.36])]))

# ================================================================= PAGE 7: first months + do/avoid
A(CondPageBreak(120 * mm))
A(Paragraph("The first six months (recommended plan, base case)", S["h1"]))
mrow = [["Month", "Microgreens sales", "Tower sales", "Cash profit before ₹40,000", "Cash profit after ₹40,000", "Cash balance"]]
for r in REC["rows"][:6]:
    mrow.append([r["calendar_month"], inr(r["microgreens_revenue_inr"]), inr(r["tower_revenue_inr"]), inr(r["ebitda_before_commitment_inr"], True),
                 inr(r["ebitda_after_commitment_inr"], True), inr(r["cash_balance_inr"])])
A(table(mrow, [FW * 0.14, FW * 0.16, FW * 0.14, FW * 0.20, FW * 0.19, FW * 0.17], right=(1, 2, 3, 4, 5)))
A(Paragraph(f"Oct–Dec 2026: {inr(ANS['oct_dec_2026_ebitda_before_commitment_inr'])} before and {inr(ANS['oct_dec_2026_ebitda_after_commitment_inr'])} "
            f"after the ₹40,000 payments. First profit: February 2027; after the payments: September 2027. Lowest cash {inr(ANS['lowest_cash_balance_inr'])} "
            "(September 2027). With bad-case inputs cash goes below zero from March 2027, so follow the stop rules (stop microgreens below ₹700/kg).", S["small"]))
todo = [["What to do", "What to avoid"],
        ["1. Apply this week for a BESCOM LT-5 3-phase connection on the owned 60-cent plot.", "Do not order 200 or more towers."],
        ["2. File for FSSAI, GSTIN, Udyam and the trademark.", "Do not build moulds or buy machines yet."],
        ["3. Send water samples from every source to a lab.", "Do not build on the one-year free plot."],
        ["4. Start microgreens at 50 trays a week; reprice to ₹79–99 per 50 g.", "Do not borrow before results show 1.3× debt cover."],
        ["5. Start trading greens through Floruvi for advance UPI payment.", "Do not pledge family land."],
        ["6. Put your 5 towers + 5 on one shared tank; add 4–6 raft beds beside them.", "Do not pay below the legal minimum wage."],
        ["7. Hire one legal resident caretaker; fit CCTV, a siren and lights.", "Do not accept buy-back or “guaranteed income” deals."],
        ["8. Keep ₹4.4 lakh for the payments and a ₹3 lakh reserve.", "Do not grow mint, palak, coriander or iceberg in towers."],
        ["9. Record grams per plant, losses, hours and price for every harvest.", "Do not copy a tower design before an IP search."],
        ["10. Review Gate A in late December and Gate B in late March.", "Do not export before steady weekly volume and advance payment."]]
A(KeepTogether([Paragraph("What to do, and what to avoid", S["h2"]), table(todo, [FW * 0.56, FW * 0.44])]))

# ================================================================= PAGE 8: crops + build cost
A(CondPageBreak(120 * mm))
A(Paragraph("Which crop earns the most (towers, checked model)", S["h1"]))
cr = [["#", "Crop", "₹ per tower a month", "₹ per tower per 40 days", "Towers buyers take", "Fit"]]
for i, r in enumerate(sorted(CROPS, key=lambda x: -x["contribution_inr_per_tower_per_month"]), 1):
    cr.append([str(i), escape(r["crop"]), inr(r["contribution_inr_per_tower_per_month"]), inr(r["contribution_inr_per_tower_per_40d"]),
               f"{r['market_cap_towers']:.0f}", r["tower_fit"]])
A(table(cr, [FW * 0.05, FW * 0.37, FW * 0.15, FW * 0.17, FW * 0.14, FW * 0.12], right=(0, 2, 3, 4)))
A(Paragraph("After seeds, media, nutrients, packing, delivery, commissions and unsold produce; before staff, power and water. Raft beds give "
            "about 1.5 times these kilograms per 90 plants (estimate).", S["small"]))
GROUPS = [("Towers or beds, freight, assembly, spares", ("tower_kits", "tower_gst", "tower_freight", "tower_assembly", "tower_spares")),
          ("Polyhouse, fans, foggers, site work", ("structure", "haf_fans", "fogger", "site_prep")),
          ("Water: RO plant and tanks", ("ro", "tanks")),
          ("Power: wiring, safety, backup, connection", ("electrical", "backup", "grid_normative", "grid_deposit", "grid_meter", "transformer")),
          ("Security: CCTV and fence", ("cctv", "fence")),
          ("Post-harvest: cold storage and packing", ("cold", "packing")),
          ("People: welfare and caretaker room", ("welfare", "quarters")),
          ("Nursery, meters, registrations, marketing, first stock", ("nursery", "tools", "registrations", "water_tests", "initial_marketing", "starting_stock")),
          ("Contingency (10%)", ("contingency",))]


def capex_groups(N, p):
    by = {}
    for it in m.capex_items(N, p, "full"):
        by[it["key"]] = by.get(it["key"], 0.0) + it["inr"]
    grouped = [(lab, sum(by.get(k, 0.0) for k in keys)) for lab, keys in GROUPS]
    used = {k for _, keys in GROUPS for k in keys}
    other = sum(v for k, v in by.items() if k not in used)
    if other > 0.5:
        grouped.append(("Other site items", other))
    return grouped, sum(by.values())


g_own, t_own = capex_groups(200, obf.options(pb)["own3k"])
g_dwc, t_dwc = capex_groups(150, obf.options(pb)["dwc"])
cx = [["Item (base, GST included)", "200 own towers", "150 raft-bed units"]]
labs = [l_ for l_, _ in g_own] + [l_ for l_, _ in g_dwc if l_ not in [x for x, _ in g_own]]
do_, dd_ = dict(g_own), dict(g_dwc)
for lab in labs:
    cx.append([lab, inr(do_.get(lab, 0.0)), inr(dd_.get(lab, 0.0))])
cx.append(["Moulds, design and tests (own towers, ring only)", inr(obf.TOOLING["base"]), "–"])
cx.append(["<b>Total</b>", "<b>" + inr(t_own + obf.TOOLING["base"]) + "</b>", "<b>" + inr(t_dwc) + "</b>"])
A(KeepTogether([Paragraph("What it costs to build", S["h2"]), table(cx, [FW * 0.52, FW * 0.24, FW * 0.24], right=(1, 2))]))

# ================================================================= PAGE 9: pain points
A(CondPageBreak(160 * mm))
A(Paragraph("Every pain point, most serious first", S["h1"]))
sev_order = {"critical": 0, "major": 1, "minor": 2}
EXTRA = [{"severity": "major", "category": "Build cost", "pain": "Moulds before the first own tower: ₹12.4–26 lakh; the ₹3,000 body is realistic only above about 2,200 towers",
          "fix": "No moulds for the first 200; mould only the ring later; written quotes"},
         {"severity": "major", "category": "Build cost", "pain": "Plastic (PP) rose 70% in 2026, to ₹154.7/kg; ₹30/kg moves the body about ₹300",
          "fix": "Tie contract prices to the IOCL list"},
         {"severity": "major", "category": "Law", "pain": "Copying a registered design can bring a claim of up to ₹50,000 per design, or damages and an injunction",
          "fix": "IP India design and patent search before tooling"},
         {"severity": "minor", "category": "Raft beds", "pain": "Raft-bed yields, labour and power-cut hours are estimates; beds need a level floor, mosquito control and a big first water fill",
          "fix": "Pilot 4–6 beds for 2–3 crops before scaling"}]
allp = sorted(list(PAINS) + EXTRA, key=lambda x: sev_order.get(x["severity"], 3))
pp = [["Severity", "Area", "Pain point", "Fix"]]
for p_ in allp:
    pp.append([p_["severity"], escape(p_["category"]), escape(p_["pain"])[:260], escape(p_.get("fix", ""))[:200]])
A(table(pp, [FW * 0.09, FW * 0.12, FW * 0.47, FW * 0.32]))

# ================================================================= PAGE 10: research used
A(CondPageBreak(150 * mm))
A(Paragraph("Research used", S["h1"]))
A(Paragraph("18 research agents read 724 unique sources on 29 September 2026. Two reviewers found 50 issues; the final agent accepted 21 fixes and "
            "rejected 7 with reasons. Every link is in the appendix.", S["body"]))
FIND = {"towers": "Kit ₹9,500–13,500 plus GST; installed about ₹14,700; about 1.9 m² per tower; pumps last about 2 years.",
        "structure": "Naturally ventilated polyhouse about ₹1,150/m²; shade-net houses let the monsoon rain in; film lasts about 3 years.",
        "climate": "Nov–Feb best; Mar–May lettuce −40%; Jun–Oct basil −30%; about 25% losses in the first 6 months.",
        "power": "LT-5 ‘Green House’ about ₹6.1 a unit all-in; LT-3 about ₹8.8; roots dry in 30–60 minutes without flow.",
        "water": "0.21 L per plant a day; salty groundwater, so RO (wastes about half); hot months up to 2×.",
        "consumables": "About ₹3.6 per lettuce plant per 40 days; own-mixed nutrients ₹170 per 1,000 L.",
        "labour": "Farm minimum wage ₹14,299 (₹20,350 in court); legal 12-h guard at least ₹32,998; CCTV about ₹83,000.",
        "lettuce": "80–100 g a head in 90-site towers (trials 53–95 g); Lollo Rosso and green oakleaf first; Batavia in Mar–May.",
        "herbs": "30–50 g per plant per 40 days; restaurants pay ₹150/kg for basil; premium shops ₹750/kg in small amounts.",
        "greens": "Kale ₹144/kg, bok choy ₹136/kg at Hyperpure; palak, methi and amaranth lose money in towers.",
        "strawberry_micro": "Microgreens: the only 30-day cash option; break-even about ₹700/kg. Strawberries weak.",
        "prices": "Hyperpure lettuce ₹140–216/kg; bulk ₹35–65/kg; BigBasket hydroponic heads ₹375–525/kg.",
        "demand": "New-seller demand 26 → 95 → 210 → 400 kg a week (months 1, 3, 6, 12).",
        "logistics": "Delivery costs more than packing; restaurant drops ₹30–40/kg at small volume; cold room ₹1.8–3.8 lakh.",
        "export": "Legal within 90 days; first shipment about 75 days away; only basil pilots with advance payment.",
        "finance_risk": "No subsidy pays in 3 months; AIF about 6%; NHB 35% and more than 4,000 m²."}
TOPIC = {"towers": "Towers", "structure": "Polyhouse", "climate": "Climate", "power": "Power", "water": "Water", "consumables": "Supplies",
         "labour": "Labour and security", "lettuce": "Lettuce", "herbs": "Herbs", "greens": "Other greens", "strawberry_micro": "Strawberries and microgreens",
         "prices": "Prices", "demand": "Demand and competition", "logistics": "Packing and delivery", "export": "Export", "finance_risk": "Finance, law and risk"}


def top_domains(sources, k=4):
    c = Counter()
    for s_ in sources:
        u = url_of(s_) if isinstance(s_, str) else None
        if u:
            c[re.sub(r"^https?://(www\.)?", "", u).split("/")[0]] += 1
    return ", ".join(d for d, _ in c.most_common(k))


rs = [["Topic", "Key findings", "Most-cited websites"]]
for b in RES:
    rs.append([TOPIC.get(b["key"], b["key"]), escape(FIND.get(b["key"], "")), escape(top_domains(b.get("sources", [])))])
rs.append(["Moulding and manufacturing", "₹3,000 body realistic above about 2,200 towers; moulds ₹12.4–26 lakh; PP ₹154.7/kg; DIY PVC cheapest to 600.",
           escape(top_domains(MOULD.get("sources", [])))])
rs.append(["Pump clusters and systems", "10 towers per 1,000 L tank; raft beds cheapest per kg, 140 g heads, 12–72 h power-cut tolerance (estimate).",
           escape(top_domains(SYSR.get("sources", [])))])
A(table(rs, [FW * 0.17, FW * 0.51, FW * 0.32]))
KEYDOCS = [("BESCOM tariffs FY2025-26 to FY2027-28 (KERC order, 27 March 2025)", "https://kerc.karnataka.gov.in/uploads/85821743074692.pdf"),
           ("Karnataka minimum wages 2026-27 (Labour Department)", "https://karmikaspandana.karnataka.gov.in/64/minimum-wages-rates-for-the-year-2026-27/en"),
           ("MIDH Operational Guidelines 2025 (subsidy norms)", "https://nhb.gov.in/writereaddata/082825102800MIDH%20Guideline%202025.pdf"),
           ("Agriculture Infrastructure Fund guidelines (September 2024)", "https://agriinfra.dac.gov.in/Content/DocAttachment/FINALSchemeGuidelinesAIF.pdf"),
           ("IOCL polymer price list, 16 September 2026 (PP price)", "https://www.plastemart.com/Upload/pricelist/16-09-2026-IOCL-Price-List.pdf"),
           ("IP India design search", "https://search.ipindia.gov.in/designsearch"),
           ("IP India patent search", "https://iprsearch.ipindia.gov.in/PublicSearch"),
           ("Touliatos et al. 2016: tower against flat lettuce yield", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5001193/"),
           ("University of Kentucky: hydroponic lettuce crop profile", "https://ccd.uky.edu/sites/default/files/2024-11/ccd-cp-063_hydroponic-lettuce.pdf"),
           ("UAS Bangalore: hydroponic firms study", "https://www.uasbangalore.edu.in/wp-content/uploads/2024/12/3.pdf"),
           ("CGWB groundwater report, Bangalore Urban", "https://cgwb.gov.in/sites/default/files/2022-10/bangalore_urban-2012.pdf"),
           ("Hyperpure Bengaluru exotic vegetables (29 Sep 2026)", "https://www.hyperpure.com/ind/bengaluru/exotic-vegetable"),
           ("BigBasket lettuce listing (29 Sep 2026)", "https://www.bigbasket.com/ss/lettuce/"),
           ("Entrackr: Deep Rooted to shut operations", "https://entrackr.com/exclusive/exclusive-accel-backed-deep-rooted-to-shut-operations-8865073"),
           ("Wikipedia: Bowery Farming (also AeroFarms, AppHarvest)", "https://en.wikipedia.org/wiki/Bowery_Farming")]
kd = [["Key document", "Link"]] + [[escape(n), link(u, n=70)] for n, u in KEYDOCS]
A(KeepTogether([Paragraph("Key documents", S["h2"]), table(kd, [FW * 0.42, FW * 0.58])]))
A(Paragraph("A 20–30 year plan", S["h2"]))
A(Paragraph("2026–27: side lines and the pilot; build a buyer list. 2027–28: 150 units if Gate B passes; keep boxes, microgreens and trading. "
            "2028–31: 300 units only with contracts or higher measured margins. Later: up to about 1,500 units on owned land, only with contracts, "
            "secure water and a sales team. Every year: pay yourself a fixed amount, and save for film, pumps and replacements. A durable family income "
            "comes from a well-run small farm with direct customers, not from a giant farm.", S["body"]))

# ================================================================= APPENDIX
A(NextPageTemplate("twocol"))
A(PageBreak())
A(Paragraph("Appendix: every source used", S["h1"]))
seen = set()
count = 0
blocks = [(TOPIC.get(b["key"], b["key"]), b.get("sources", [])) for b in RES]
blocks += [("Moulding and manufacturing", MOULD.get("sources", [])), ("Pump clusters and systems", SYSR.get("sources", []))]
for name, sources in blocks:
    A(Paragraph(escape(name), S["srch"]))
    for s in sources:
        if not isinstance(s, str):
            continue
        u = url_of(s)
        key = u or s
        if key in seen:
            continue
        seen.add(key)
        count += 1
        note = s.replace(u, "").strip(" -–()[]:;,") if u else ""
        txt = link(u, n=140) if u else escape(s[:200])
        if note and u:
            txt += f' <font color="#626b5e">({escape(note[:90])})</font>'
        A(Paragraph(txt, S["src"]))

doc.build(st)
print("wrote", OUT, "sources listed:", count)
