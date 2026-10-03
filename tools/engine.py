"""Worksheet builder: HTML (+ matplotlib SVG diagrams) -> PDF via headless Chrome."""
import io, os, subprocess, html, tempfile
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

matplotlib.rcParams["svg.fonttype"] = "none"
matplotlib.rcParams["font.family"] = "Helvetica"

BLUE, DBLUE, LBLUE, GREY = "#2563eb", "#1e40af", "#dbeafe", "#f3f4f6"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page{size:A4;margin:14mm 14mm 16mm}
*{box-sizing:border-box}
body{font-family:Helvetica,Arial,sans-serif;font-size:11.5pt;line-height:1.45;color:#1f2937;margin:0}
.head{background:#2563eb;color:#fff;border-radius:12px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}
.head h1{font-size:19pt;margin:0;line-height:1.15}
.head .brand{font-size:9.5pt;opacity:.95;text-align:right}
.tags{margin:8px 0 6px;font-size:9.5pt}.tags span{background:#dbeafe;color:#1e40af;border-radius:99px;padding:2px 10px;margin-right:6px;font-weight:700}
.name{display:flex;gap:24px;margin:8px 0 10px;font-size:10.5pt}.name div{flex:1;border-bottom:1.5px solid #9ca3af;padding-bottom:2px;color:#6b7280}
.box{border-radius:10px;padding:10px 14px;margin:10px 0;break-inside:avoid}
.remember{background:#eff6ff;border-left:6px solid #2563eb}
.example{background:#f3f4f6;border-left:6px solid #16a34a}
.tip{background:#fef9c3;border-left:6px solid #eab308}
.box h3{margin:0 0 4px;font-size:11.5pt;color:#1e40af}
.example h3{color:#15803d}.tip h3{color:#a16207}
h2{font-size:13.5pt;color:#1e40af;border-bottom:2.5px solid #dbeafe;padding-bottom:3px;margin:16px 0 8px;break-after:avoid}
ol.q{padding-left:0;margin:0;list-style:none;counter-reset:q}
ol.q>li{counter-increment:q;position:relative;padding-left:28px;margin:0 0 9px;break-inside:avoid}
ol.q>li:before{content:counter(q);position:absolute;left:0;top:0;width:21px;height:21px;border-radius:50%;background:#2563eb;color:#fff;font-size:9.5pt;font-weight:700;text-align:center;line-height:21px}
.ans{display:inline-block;border-bottom:1.3px dotted #6b7280;min-width:110px;margin-left:6px}
.work{height:26px}
.fig{text-align:center;margin:6px 0}.fig svg{max-width:100%;height:auto}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:4px 26px}
.cols.three{grid-template-columns:1fr 1fr 1fr}
table.t{border-collapse:collapse;margin:6px auto;font-size:10.5pt}
table.t td,table.t th{border:1.3px solid #6b7280;padding:3px 9px;text-align:center;min-width:34px}
table.t th{background:#dbeafe}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
.card{background:#fff;border:2px solid #bfdbfe;border-radius:10px;padding:7px 8px;text-align:center;font-size:10.5pt;break-inside:avoid}
.card b{display:block;color:#1e40af;font-size:11pt;margin-bottom:2px}
.challenge h2{color:#b45309;border-color:#fde68a}
.foot{margin-top:14px;font-size:8.5pt;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:6px}
.sup{font-size:.7em;vertical-align:super;line-height:0}
.frac{display:inline-block;text-align:center;vertical-align:middle;line-height:1.1}.frac>span{display:block;padding:0 3px}.frac>span:first-child{border-bottom:1.3px solid currentColor}
.key h2{color:#15803d;border-color:#bbf7d0}
.key .a{color:#15803d;font-weight:700}
"""


def svg(fig):
    buf = io.StringIO()
    fig.savefig(buf, format="svg", bbox_inches="tight", transparent=True)
    plt.close(fig)
    s = buf.getvalue()
    return s[s.index("<svg"):]


def fig_html(fig, caption=""):
    cap = f'<div style="font-size:9pt;color:#6b7280">{html.escape(caption)}</div>' if caption else ""
    return f'<div class="fig">{svg(fig)}{cap}</div>'


def frac(n, d):
    return f'<span class="frac"><span>{n}</span><span>{d}</span></span>'


def sup(t):
    return f'<span class="sup">{t}</span>'


def box(kind, title, body):
    return f'<div class="box {kind}"><h3>{title}</h3>{body}</div>'


def build(ws, out_dir):
    """ws: dict(slug,title,topic,difficulty,unit,intro:list[str],sections:list[(heading, [ (q, ans, opts) ], kind)])"""
    os.makedirs(out_dir, exist_ok=True)
    for mode in ("worksheet", "answers"):
        parts = []
        key = mode == "answers"
        title = ws["title"] + (" – Answer Sheet" if key else "")
        parts.append(f'<div class="head"><h1>{html.escape(title)}</h1><div class="brand">📘 WorksheetHub AI<br>Mathematics · Grade 7</div></div>')
        parts.append(f'<div class="tags"><span>{ws["unit"]}</span><span>{ws["difficulty"]}</span><span>{html.escape(ws["topic"])}</span></div>')
        if not key:
            parts.append('<div class="name"><div>Name:</div><div>Date:</div><div>Score: &nbsp;&nbsp;/ ' + str(sum(len(s[1]) for s in ws["sections"])) + '</div></div>')
            parts.extend(ws["intro"])
        qn = 0
        for sec in ws["sections"]:
            heading, qs = sec[0], sec[1]
            kind = sec[2] if len(sec) > 2 else ""
            wrap = f'<div class="{"key " if key else ""}{kind}">'
            parts.append(wrap + f"<h2>{heading}</h2>")
            cls = "cols" if (len(sec) > 3 and sec[3] == "cols" and not key) else ""
            parts.append(f'<ol class="q {cls}" start="{qn+1}" style="counter-reset:q {qn}">')
            for q in qs:
                qn += 1
                text, ans = q[0], q[1]
                fig = q[2] if len(q) > 2 else ""
                if key:
                    parts.append(f'<li>{ans}</li>')
                else:
                    work = '<div class="work"></div>' if kind != "nolines" else ""
                    parts.append(f'<li>{text}{fig}<div>Answer: <span class="ans"></span></div>{work}</li>')
            parts.append("</ol></div>")
        parts.append('<div class="foot">Free from WorksheetHub AI · Created with AI assistance and checked by the website creator before publication.</div>')
        doc = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(parts)}</body></html>"
        name = ws["slug"] + ("-answers" if key else "")
        hp = os.path.join(tempfile.gettempdir(), name + ".html")
        open(hp, "w").write(doc)
        pdf = os.path.join(out_dir, name + ".pdf")
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={pdf}", "file://" + hp],
                       check=True, capture_output=True, timeout=120)
        print("built", pdf)
