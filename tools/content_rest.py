import math
from fractions import Fraction
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon, Wedge, FancyBboxPatch
import numpy as np
from engine import *

OUT = "/Users/suminsethi/Desktop/claude folder/WorksheetHub AI/worksheets/math/grade7"
A = lambda t: f'<span class="a">{t}</span>'
M = lambda x: f"{x:g}"


# ---------------------------------------------------------------- 6. Percentages
def percentages():
    fig, ax = plt.subplots(figsize=(7.2, 1.7)); ax.set_xlim(0, 10); ax.set_ylim(-.2, 2); ax.axis("off")
    for i, (lab, col, val) in enumerate([("Cost price (CP)\nwhat the shop PAYS", "#bfdbfe", "$80"), ("Selling price (SP)\nwhat the shop CHARGES", "#2563eb", "$100")]):
        ax.add_patch(FancyBboxPatch((.3 + i * 5, .1), 4.4, 1.3, boxstyle="round,pad=.05", fc=col, ec="#1e40af"))
        ax.text(2.5 + i * 5, .75, lab, ha="center", va="center", fontsize=10.5, color="white" if i else "#1f2937")
    ax.text(5, 1.65, "SP > CP = PROFIT      SP < CP = LOSS", ha="center", fontsize=11, color="#1e40af", fontweight="bold")
    img = fig_html(fig)
    intro = [box("remember", "🔎 Remember", f"<b>Percent</b> means “out of 100”. To find 15% of 240: 240 × 0.15 = 36.<br>"
                 f"<b>Profit</b> = SP − CP &nbsp;|&nbsp; <b>Loss</b> = CP − SP &nbsp;|&nbsp; <b>% profit (or loss)</b> = {frac('profit or loss','CP')} × 100<br>"
                 "<b>Commission</b> = a % of the sales you make. <b>Tax</b> = a % added on top of the price."), img,
             box("example", "✏️ Worked example", "A shop buys a bag for $80 and sells it for $100.<br>Profit = 100 − 80 = $20. &nbsp; % profit = 20 ÷ 80 × 100 = <b>25%</b>")]
    pc = [(15, 240), (20, 85), (5, 360), (35, 120)]
    secs = [
        ("A. Percentage of an amount", [(f"Find <b>{p}%</b> of <b>${a}</b>.", A(f"{p}% of ${a} = ${M(a*p/100)}")) for p, a in pc], "", "cols"),
        ("B. Profit and loss", [
            ("A shop buys a toy for $60 and sells it for $75. Find the profit and the % profit.", A("Profit = $15; 15 ÷ 60 × 100 = 25% profit")),
            ("A phone cost $250 and was sold for $200. Find the loss and the % loss.", A("Loss = $50; 50 ÷ 250 × 100 = 20% loss")),
            ("Sara buys a bike for $120 and sells it at a 30% profit. What is the selling price?", A("Profit = 30% of 120 = $36; SP = $156")),
        ]),
        ("C. Commission and tax", [
            ("Omar earns 8% commission on sales. He sells $2 500 of goods. How much commission does he earn?", A("8% of 2500 = $200")),
            ("A meal costs $40 before 5% tax is added. What is the total bill?", A("Tax = 5% of 40 = $2, total = $42")),
            ("A jacket costs $90. In a sale there is 20% off. What is the sale price?", A("20% of 90 = $18, so price = $72")),
            ("A price of $60 increases by 15%. What is the new price?", A("15% of 60 = $9, new price = $69")),
        ]),
        ("⭐ Challenge", [
            ("A shopkeeper buys 50 pens for $100 and sells them all at $3 each. Find the % profit.", A("Total SP = $150, profit = $50, 50 ÷ 100 × 100 = 50%")),
            ("An item costs $80 after a 20% discount. What was the original price?", A("$80 is 80% of the original, so original = 80 ÷ 0.8 = $100")),
        ], "challenge"),
    ]
    return dict(slug="percentages-profit-loss-tax", title="Percentages: Profit, Loss, Commission & Tax", topic="Percentages", difficulty="Medium", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Calculate percentages of amounts, profit and loss, commission and tax in everyday shopping situations.")


# ---------------------------------------------------------------- 7. Speed, distance, time
def sdt():
    fig, ax = plt.subplots(figsize=(3.6, 3.0)); ax.set_xlim(0, 6); ax.set_ylim(0, 5); ax.axis("off"); ax.set_aspect("equal")
    ax.add_patch(Polygon([[3, 4.8], [.3, .2], [5.7, .2]], closed=True, fc="#eff6ff", ec="#1e40af", lw=2))
    ax.plot([1.3, 4.7], [1.9, 1.9], color="#1e40af", lw=2); ax.plot([3, 3], [1.9, .2], color="#1e40af", lw=2)
    ax.text(3, 3, "D", ha="center", va="center", fontsize=22, fontweight="bold", color="#1e40af")
    ax.text(1.9, .9, "S", ha="center", va="center", fontsize=22, fontweight="bold", color="#2563eb")
    ax.text(4.1, .9, "T", ha="center", va="center", fontsize=22, fontweight="bold", color="#2563eb")
    tri = fig_html(fig, "Cover what you want to find")
    side = ("<div style='display:grid;grid-template-columns:1fr 1.3fr;align-items:center;gap:10px'>" + tri +
            "<div class='cards' style='grid-template-columns:1fr'>"
            f"<div class='card'><b>Speed</b>S = D ÷ T</div><div class='card'><b>Distance</b>D = S × T</div><div class='card'><b>Time</b>T = D ÷ S</div></div></div>")
    intro = [box("remember", "🔎 Remember", "Speed tells you how far you go in one hour (km/h) or one second (m/s). Keep the units matching: km with hours, m with seconds.<br>"
                 "To change minutes to hours, divide by 60: 45 min = 0.75 h. To change 0.25 h to minutes, multiply by 60: = 15 min."), side,
             box("example", "✏️ Worked example", "A car travels 150 km in 3 hours. Speed = 150 ÷ 3 = <b>50 km/h</b>.")]
    secs = [
        ("A. Find the speed", [
            ("A cyclist rides 60 km in 4 hours. Find her speed.", A("60 ÷ 4 = 15 km/h")),
            ("A runner covers 400 m in 50 seconds. Find his speed in m/s.", A("400 ÷ 50 = 8 m/s")),
            ("A train goes 90 km in 1 h 30 min. Find its speed.", A("1 h 30 min = 1.5 h; 90 ÷ 1.5 = 60 km/h")),
        ]),
        ("B. Find the distance", [
            ("A car travels at 60 km/h for 2.5 hours. How far does it go?", A("60 × 2.5 = 150 km")),
            ("A bus travels at 40 km/h for 45 minutes. How far does it go?", A("45 min = 0.75 h; 40 × 0.75 = 30 km")),
            ("A plane flies at 800 km/h for 3 hours. How far does it fly?", A("800 × 3 = 2 400 km")),
        ]),
        ("C. Find the time", [
            ("A lorry goes 240 km at 80 km/h. How long does it take?", A("240 ÷ 80 = 3 hours")),
            ("How long does it take to walk 6 km at 4 km/h? Give your answer in hours and minutes.", A("6 ÷ 4 = 1.5 h = 1 h 30 min")),
            ("A car travels 100 km at 80 km/h. How long does it take in hours and minutes?", A("100 ÷ 80 = 1.25 h = 1 h 15 min")),
        ]),
        ("D. Problem", [
            ("Aisha leaves home at 9:15 am and drives 90 km at 60 km/h. At what time does she arrive?", A("Time = 90 ÷ 60 = 1.5 h = 1 h 30 min; arrives 10:45 am")),
        ]),
        ("⭐ Challenge", [
            ("A car goes 60 km at 30 km/h, then another 60 km at 60 km/h. Find the average speed for the whole journey.", A("Time = 2 h + 1 h = 3 h; distance = 120 km; average speed = 120 ÷ 3 = 40 km/h (not 45!)")),
            ("Convert 72 km/h into m/s.", A("72 km/h = 72 000 m ÷ 3 600 s = 20 m/s")),
        ], "challenge"),
    ]
    return dict(slug="speed-distance-time", title="Speed, Distance & Time", topic="Speed, distance and time", difficulty="Medium", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Use the speed-distance-time triangle to solve journey problems, including unit conversion.")


# ---------------------------------------------------------------- 8. Solving equations
def equations():
    fig, ax = plt.subplots(figsize=(7.2, 2.4)); ax.set_xlim(0, 12); ax.set_ylim(0, 4.2); ax.axis("off")
    ax.plot([6, 6], [.3, 2.2], color="#1e40af", lw=3); ax.plot([2, 10], [2.2, 2.2], color="#1e40af", lw=3)
    ax.add_patch(Polygon([[5.2, .3], [6.8, .3], [6, 1]], fc="#1e40af"))
    for cx, items in ((3.4, ["x", "+3"]), (8.6, ["8"])):
        ax.add_patch(Rectangle((cx - 1.4, 2.25), 2.8, .1, color="#6b7280"))
        for k, t in enumerate(items):
            ax.add_patch(FancyBboxPatch((cx - 1.3 + k * 1.4, 2.45), 1.2, 1.0, boxstyle="round,pad=.04", fc="#2563eb" if t == "x" else "#bfdbfe", ec="#1e40af"))
            ax.text(cx - .7 + k * 1.4, 2.95, t, ha="center", va="center", fontsize=15, fontweight="bold", color="white" if t == "x" else "#1f2937")
    ax.text(6, 3.95, "x + 3 = 8   →   take 3 from BOTH sides   →   x = 5".replace("→", "then"), ha="center", fontsize=11.5, color="#1e40af")
    bal = fig_html(fig, "An equation is a balance. Whatever you do to one side, do to the other.")
    intro = [box("remember", "🔎 Remember", "To solve an equation, <b>undo</b> the operations using the <b>opposite</b> (inverse) operation, in reverse order, keeping the equation balanced.<br>"
                 "+ and − are opposites. × and ÷ are opposites."), bal,
             box("example", "✏️ Worked example", "Solve 3x + 2 = 17<br>Step 1: subtract 2 from both sides → 3x = 15<br>Step 2: divide both sides by 3 → <b>x = 5</b><br>Check: 3 × 5 + 2 = 17 ✔")]
    secs = [
        ("A. One-step equations", [("x + 7 = 15", A("x = 8")), ("y − 5 = 9", A("y = 14")), ("4a = 28", A("a = 7")), (f"{frac('b',3)} = 6", A("b = 18"))], "", "cols"),
        ("B. Two-step equations", [("3x + 2 = 17", A("3x = 15, x = 5")), ("5y − 4 = 21", A("5y = 25, y = 5")), (f"{frac('x',2)} + 3 = 9", A("x ÷ 2 = 6, x = 12")), ("7 + 2m = 19", A("2m = 12, m = 6"))], "", "cols"),
        ("C. Equations with brackets", [("2(x + 3) = 18", A("x + 3 = 9, x = 6 (or 2x + 6 = 18, x = 6)")), ("3(2x − 1) = 21", A("6x − 3 = 21, 6x = 24, x = 4")), ("4(y − 2) = 20", A("y − 2 = 5, y = 7"))]),
        ("D. Word problems", [
            ("I think of a number, double it and add 5. The answer is 17. What is my number?", A("2n + 5 = 17, 2n = 12, n = 6")),
            ("A taxi charges $4 plus $3 per km. A trip costs $19. How many km was the trip?", A("4 + 3k = 19, 3k = 15, k = 5 km")),
            ("The perimeter of a rectangle is 32 cm. Its length is x + 4 and its width is x. Find x.", A("2(x + 4) + 2x = 32; 4x + 8 = 32; 4x = 24; x = 6 cm")),
        ]),
        ("⭐ Challenge", [
            ("Solve 5x − 3 = 2x + 9 (x is on both sides).", A("Subtract 2x: 3x − 3 = 9; add 3: 3x = 12; x = 4")),
            ("Solve 2(3x − 4) = 4x + 6.", A("6x − 8 = 4x + 6; 2x = 14; x = 7")),
        ], "challenge"),
    ]
    return dict(slug="solving-equations", title="Solving Equations", topic="Solving linear equations", difficulty="Medium", unit="Unit 2 · Algebra",
                intro=intro, sections=secs, desc="Solve one-step, two-step and bracket equations with a balance-scale picture and worked examples.")


# ---------------------------------------------------------------- 9. Angles
def ray(ax, o, ang, L=2.2, col="#1f2937"):
    a = math.radians(ang); ax.plot([o[0], o[0] + L * math.cos(a)], [o[1], o[1] + L * math.sin(a)], color=col, lw=2)


def arc(ax, o, a1, a2, r=.6, col="#2563eb"):
    ax.add_patch(Wedge(o, r, a1, a2, fc=col, alpha=.35, ec=col))


def angles():
    def blank(w=3.6, h=2.2):
        f, a = plt.subplots(figsize=(w, h)); a.set_aspect("equal"); a.axis("off"); return f, a
    f1, a1 = blank(); a1.plot([-2.5, 2.5], [0, 0], color="#1f2937", lw=2); ray(a1, (0, 0), 65, 2.2); arc(a1, (0, 0), 0, 65, .7); arc(a1, (0, 0), 65, 180, .5, "#dc2626")
    a1.text(.95, .3, "65°", fontsize=11); a1.text(-.9, .5, "x", fontsize=14, color="#dc2626"); a1.set_xlim(-2.6, 2.6); a1.set_ylim(-.3, 2.4)
    f2, a2 = blank(); pts = [(0, 0), (4, 0), (2.59, 3.32)]; a2.add_patch(Polygon(pts, fill=False, ec="#1f2937", lw=2))
    a2.text(.45, .1, "52°", fontsize=10); a2.text(3.0, .1, "67°", fontsize=10); a2.text(2.45, 2.55, "x", fontsize=14, color="#dc2626"); a2.set_xlim(-.3, 4.3); a2.set_ylim(-.3, 3.6)
    f3, a3 = blank(); [ray(a3, (0, 0), t, 1.8) for t in (0, 120, 215)]; a3.text(1.0, .35, "120°", fontsize=10); a3.text(-1.3, .9, "95°", fontsize=10); a3.text(-.4, -1.3, "x", fontsize=14, color="#dc2626"); a3.text(.9, -1.0, "?", fontsize=1, color="white")
    a3.text(-.95, -.4, "", fontsize=1); a3.set_xlim(-2.2, 2.2); a3.set_ylim(-2, 2)
    f4, a4 = blank(4.4, 2.9); a4.plot([-2.8, 2.8], [1.6, 1.6], color="#1f2937", lw=2); a4.plot([-2.8, 2.8], [0, 0], color="#1f2937", lw=2)
    ang = 65; dx = 1.6 / math.tan(math.radians(ang)); P, Q = (dx * .0 + 1.0, 1.6), (1.0 - dx, 0)
    a4.plot([Q[0] - .6 * math.cos(math.radians(ang)), P[0] + .6 * math.cos(math.radians(ang))], [-.6 * math.sin(math.radians(ang)), 1.6 + .6 * math.sin(math.radians(ang))], color="#1f2937", lw=2)
    a4.text(P[0] + .35, P[1] + .1, "65°", fontsize=10); a4.text(Q[0] + .35, Q[1] + .15, "a", fontsize=13, color="#dc2626"); a4.text(Q[0] - .75, Q[1] + .15, "b", fontsize=13, color="#dc2626"); a4.text(P[0] + .3, P[1] - .4, "c", fontsize=13, color="#dc2626")
    for yy in (1.6, 0):
        a4.annotate("", xy=(2.3, yy), xytext=(1.9, yy), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    a4.set_xlim(-2.9, 2.9); a4.set_ylim(-.8, 2.5)
    f1h = fig_html(f1, "Angles on a straight line = 180°"); f2h = fig_html(f2, "Angles in a triangle = 180°"); f3h = fig_html(f3, "Angles around a point = 360°"); f4h = fig_html(f4, "Parallel lines (the arrows show they are parallel)")
    rules = ("<div class='cards'>"
             "<div class='card'><b>Straight line</b>angles add to 180°</div><div class='card'><b>Triangle</b>angles add to 180°</div><div class='card'><b>Around a point</b>angles add to 360°</div>"
             "<div class='card'><b>Vertically opposite</b>angles are equal (X)</div><div class='card'><b>Corresponding</b>equal (F shape)</div><div class='card'><b>Alternate</b>equal (Z shape)</div></div>")
    intro = [box("remember", "🔎 Remember", "Co-interior angles (C shape) between parallel lines add to 180°. The sum of the interior angles of a polygon with n sides is (n − 2) × 180°."), rules,
             f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">{f1h}{f2h}{f3h}{f4h}</div>']
    pent = lambda n: (n - 2) * 180
    secs = [
        ("A. Find the missing angle x", [
            ("Look at the straight-line picture: one angle is 65°. Find x.", A("x = 180 − 65 = 115°")),
            ("In the triangle picture, the other two angles are 52° and 67°. Find x.", A("x = 180 − 52 − 67 = 61°")),
            ("In the picture around a point, the angles are 120°, 95° and x. Find x. (Note: the three angles meet at a point and add to 360°, the third angle is x.)".replace(" (Note: the three angles meet at a point and add to 360°, the third angle is x.)", ""), A("x = 360 − 120 − 95 = 145°")),
            ("Two straight lines cross. One angle is 72°. Find the angle opposite it.", A("Vertically opposite angles are equal: 72°")),
        ]),
        ("B. Parallel lines (use the parallel-lines picture)", [
            ("Find angle <b>a</b> and name the rule.", A("a = 65°, corresponding angles")),
            ("Find angle <b>b</b> and name the rule.", A("b = 180 − 65 = 115° (angles on a straight line with a)")),
            ("Find angle <b>c</b> and name the rule.", A("c = 115°, alternate angles with b")),
        ]),
        ("C. Polygons", [
            ("What is the sum of the interior angles of a pentagon (5 sides)?", A(f"(5 − 2) × 180 = {pent(5)}°")),
            ("What is the sum of the interior angles of a hexagon (6 sides)?", A(f"(6 − 2) × 180 = {pent(6)}°")),
            ("What is the size of each interior angle in a regular hexagon?", A("720 ÷ 6 = 120°")),
        ]),
        ("⭐ Challenge", [
            ("A triangle has angles x, 2x and 3x. Find x and the size of each angle.", A("6x = 180, x = 30°; angles are 30°, 60°, 90°")),
            ("Each exterior angle of a regular polygon is 45°. How many sides does it have?", A("Exterior angles add to 360°: 360 ÷ 45 = 8 sides")),
        ], "challenge"),
    ]
    return dict(slug="angle-properties", title="Angle Properties", topic="Angles in lines, triangles and parallel lines", difficulty="Medium", unit="Unit 3 · Geometry",
                intro=intro, sections=secs, desc="Find missing angles on straight lines, in triangles, around points, in polygons and between parallel lines, with diagrams.")


# ---------------------------------------------------------------- 10. Pythagoras
def pythag():
    f, a = plt.subplots(figsize=(4.6, 3.0)); a.set_aspect("equal"); a.axis("off")
    a.add_patch(Polygon([[0, 0], [4, 0], [0, 3]], fc="#eff6ff", ec="#1e40af", lw=2)); a.add_patch(Rectangle((0, 0), .3, .3, fill=False, ec="#1e40af"))
    a.text(2, -.4, "a = 4", ha="center", fontsize=12); a.text(-.55, 1.5, "b = 3", ha="center", va="center", fontsize=12, rotation=90); a.text(2.3, 1.75, "c = ?", fontsize=12, color="#dc2626", fontweight="bold", rotation=-37)
    a.text(.9, 1.0, "right angle ↖".replace("↖", ""), fontsize=1, color="white"); a.set_xlim(-1, 4.6); a.set_ylim(-.8, 3.4)
    tri = fig_html(f, "c is the HYPOTENUSE: the longest side, opposite the right angle")
    f2, a2 = plt.subplots(figsize=(3.0, 3.2)); a2.set_aspect("equal"); a2.axis("off")
    a2.add_patch(Rectangle((0, 0), .12, 4, color="#9ca3af")); a2.add_patch(Rectangle((0, -.12), 3, .12, color="#9ca3af")); a2.plot([0.12, 3.0], [4.0, 0], color="#b45309", lw=4)
    a2.text(1.75, 2.3, "ladder 5 m", rotation=-54, fontsize=10, color="#b45309"); a2.text(1.5, -.55, "3 m", ha="center", fontsize=11); a2.text(-.7, 2, "h = ?", fontsize=12, color="#dc2626", rotation=90, va="center")
    a2.set_xlim(-1, 3.4); a2.set_ylim(-.9, 4.4)
    lad = fig_html(f2, "Real-life right-angled triangle")
    intro = [box("remember", "🔎 Remember", f"In a right-angled triangle: <b>a{sup(2)} + b{sup(2)} = c{sup(2)}</b> where c is the hypotenuse.<br>To find c: add the squares, then square root. To find a short side: <b>subtract</b> the squares, then square root."),
             f"<div style='display:grid;grid-template-columns:1.5fr 1fr;align-items:center'>{tri}{lad}</div>",
             box("example", "✏️ Worked example", f"Find c: &nbsp; c{sup(2)} = 3{sup(2)} + 4{sup(2)} = 9 + 16 = 25 &nbsp;→ &nbsp; c = √25 = <b>5</b>"),
             box("tip", "💡 Famous Pythagorean triples", "3-4-5 &nbsp;|&nbsp; 5-12-13 &nbsp;|&nbsp; 8-15-17 &nbsp;|&nbsp; 7-24-25 &nbsp;(and their multiples, like 6-8-10)")]
    hyp = lambda a, b: math.sqrt(a * a + b * b)
    leg = lambda c, a: math.sqrt(c * c - a * a)
    secs = [
        ("A. Find the hypotenuse", [
            ("Legs 6 cm and 8 cm. Find the hypotenuse.", A("36 + 64 = 100; c = 10 cm")),
            ("Legs 5 cm and 12 cm. Find the hypotenuse.", A("25 + 144 = 169; c = 13 cm")),
            ("Legs 6 cm and 7 cm. Find the hypotenuse to 1 decimal place.", A(f"36 + 49 = 85; c = √85 = {hyp(6,7):.1f} cm")),
        ]),
        ("B. Find a shorter side", [
            ("Hypotenuse 13 cm, one leg 5 cm. Find the other leg.", A("169 − 25 = 144; leg = 12 cm")),
            ("Hypotenuse 10 cm, one leg 6 cm. Find the other leg.", A("100 − 36 = 64; leg = 8 cm")),
            ("Hypotenuse 9 cm, one leg 4 cm. Find the other leg to 1 d.p.", A(f"81 − 16 = 65; leg = √65 = {leg(9,4):.1f} cm")),
        ]),
        ("C. Is it a right-angled triangle?", [
            ("Sides 7, 24, 25.", A("49 + 576 = 625 = 25² → YES, right-angled")),
            ("Sides 6, 8, 11.", A("36 + 64 = 100, but 11² = 121 → NO")),
        ]),
        ("D. Real-life problems", [
            ("A 5 m ladder leans against a wall with its foot 3 m from the wall (see picture). How high up the wall does it reach?", A("25 − 9 = 16; h = 4 m")),
            ("A rectangular TV screen is 24 cm wide and 7 cm high. Find the length of its diagonal.", A("576 + 49 = 625; diagonal = 25 cm")),
            ("Mia walks 80 m north then 60 m east. How far is she from where she started in a straight line?", A("6400 + 3600 = 10000; distance = 100 m")),
        ]),
        ("⭐ Challenge", [
            ("Find the distance between the points (1, 2) and (4, 6). (Hint: draw a right-angled triangle.)", A("Across = 3, up = 4; distance = √(9 + 16) = 5")),
            ("A square has a diagonal of 10 cm. Find the side length to 1 d.p.", A(f"2s² = 100; s² = 50; s = √50 = {math.sqrt(50):.1f} cm")),
        ], "challenge"),
    ]
    return dict(slug="pythagoras-theorem", title="Pythagoras’ Theorem", topic="Pythagoras theorem", difficulty="Hard", unit="Unit 3 · Geometry",
                intro=intro, sections=secs, desc="Find missing sides of right-angled triangles with Pythagoras, test for right angles and solve ladder and diagonal problems.")


# ---------------------------------------------------------------- 11. Averages
def averages():
    f, a = plt.subplots(figsize=(7.2, 1.8)); a.set_xlim(0, 10); a.set_ylim(0, 2); a.axis("off")
    cards = [("MEAN", "add all, divide\nby how many", "#2563eb"), ("MEDIAN", "the middle value\n(in order)", "#0ea5e9"), ("MODE", "the most\ncommon value", "#6366f1"), ("RANGE", "biggest − smallest\n(how spread out)", "#14b8a6")]
    for i, (t, d, c) in enumerate(cards):
        a.add_patch(FancyBboxPatch((.15 + i * 2.5, .15), 2.2, 1.7, boxstyle="round,pad=.04", fc=c, ec="none"))
        a.text(1.25 + i * 2.5, 1.35, t, ha="center", va="center", color="white", fontsize=14, fontweight="bold"); a.text(1.25 + i * 2.5, .65, d, ha="center", va="center", color="white", fontsize=9.5)
    inf = fig_html(f)
    intro = [box("remember", "🔎 Remember", "Always put the data <b>in order</b> before finding the median. If there are two middle values, the median is halfway between them."), inf,
             box("example", "✏️ Worked example: 3, 7, 5, 7, 8", "Ordered: 3, 5, 7, 7, 8 &nbsp;|&nbsp; Mean = 30 ÷ 5 = <b>6</b> &nbsp;|&nbsp; Median = <b>7</b> &nbsp;|&nbsp; Mode = <b>7</b> &nbsp;|&nbsp; Range = 8 − 3 = <b>5</b>")]
    sets = [[4, 9, 6, 9, 2], [12, 15, 11, 18, 14, 10], [3, 8, 8, 5, 8, 6, 2]]
    def stats(d):
        s = sorted(d); n = len(s); med = s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2
        modes = [x for x in set(s) if s.count(x) == max(s.count(y) for y in s)]
        return sum(d) / n, med, modes, max(s) - min(s), s
    qs = []
    for d in sets:
        mean, med, modes, rng, s = stats(d)
        qs.append((f"Find the mean, median, mode and range of: &nbsp; <b>{', '.join(map(str, d))}</b>", A(f"Ordered: {', '.join(map(str, s))}<br>Mean = {M(round(mean,2))}, Median = {M(med)}, Mode = {', '.join(map(str, modes))}, Range = {rng}")))
    table = "<table class='t'><tr><th>Goals</th><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>Matches</th><td>2</td><td>4</td><td>3</td><td>1</td></tr></table>"
    secs = [
        ("A. Find all four averages", qs),
        ("B. Frequency table", [(f"A team’s goals in 10 matches:{table}Find the mean number of goals.", A("Total goals = 0×2 + 1×4 + 2×3 + 3×1 = 13; mean = 13 ÷ 10 = 1.3")),
                                 ("Which number of goals is the mode in the table?", A("1 goal (it happens 4 times)"))]),
        ("C. Problems", [
            ("The mean of five numbers is 8. Four of them are 5, 9, 10 and 7. Find the fifth number.", A("Total = 5 × 8 = 40; 5 + 9 + 10 + 7 = 31; fifth = 9")),
            ("Daily temperatures (°C): 21, 24, 19, 26, 22, 24, 20. Find the range and say what it tells you.", A("Range = 26 − 19 = 7 °C. The temperature varied by 7 degrees over the week.")),
            ("Class A has a mean mark of 62 and range 10. Class B has a mean mark of 62 and range 40. Which class is more consistent? Why?", A("Class A – a smaller range means the marks are closer together.")),
        ]),
        ("⭐ Challenge", [
            ("Five numbers have a mode of 6, a median of 6, a mean of 6 and a range of 4. Find a possible set.", A("e.g. 4, 6, 6, 6, 8 (mean = 30 ÷ 5 = 6, range = 4)")),
            ("Why might the median be a better ‘average’ than the mean for house prices?", A("A few very expensive houses pull the mean up. The median is not affected by extreme values.")),
        ], "challenge"),
    ]
    return dict(slug="mean-median-mode-range", title="Mean, Median, Mode & Range", topic="Averages and range", difficulty="Easy", unit="Unit 4 · Data & Probability",
                intro=intro, sections=secs, desc="Find the mean, median, mode and range from lists and frequency tables and decide which average to use.")


# ---------------------------------------------------------------- 12. Probability
def probability():
    f, a = plt.subplots(figsize=(7.2, 1.7)); a.set_xlim(-.5, 10.5); a.set_ylim(-1.2, 1.6); a.axis("off")
    for x in np.linspace(0, 10, 200): a.add_patch(Rectangle((x, 0), .06, .5, color=plt.cm.RdYlGn(x / 10), lw=0))
    for x, t in ((0, "0\nimpossible"), (2.5, "0.25\nunlikely"), (5, "0.5\neven chance"), (7.5, "0.75\nlikely"), (10, "1\ncertain")):
        a.plot([x, x], [-.1, .6], color="#1f2937"); a.text(x, -.95, t, ha="center", fontsize=9.5)
    a.text(5, 1.1, "Probability scale", ha="center", fontsize=12, color="#1e40af", fontweight="bold")
    scale = fig_html(f)
    f2, a2 = plt.subplots(figsize=(2.8, 2.8)); a2.set_aspect("equal"); a2.axis("off")
    cols = ["#ef4444", "#2563eb", "#facc15", "#16a34a"] * 2; txt = ["R", "B", "Y", "G"] * 2
    for i in range(8):
        a2.add_patch(Wedge((0, 0), 1, i * 45, (i + 1) * 45, fc=cols[i], ec="white", lw=2)); ang = math.radians(i * 45 + 22.5); a2.text(.65 * math.cos(ang), .65 * math.sin(ang), txt[i], ha="center", va="center", color="white", fontweight="bold", fontsize=12)
    a2.set_xlim(-1.1, 1.1); a2.set_ylim(-1.1, 1.1)
    spin = fig_html(f2, "Spinner: 8 equal sections")
    rows = "".join("<tr><th>%d</th>" % i + "".join("<td>%d</td>" % (i + j) for j in range(1, 7)) + "</tr>" for i in range(1, 7))
    dice = "<table class='t'><tr><th>+</th>" + "".join(f"<th>{j}</th>" for j in range(1, 7)) + "</tr>" + rows + "</table>"
    intro = [box("remember", "🔎 Remember", f"<b>Probability</b> = {frac('number of ways the event can happen','total number of equally likely outcomes')}. It is always between 0 and 1.<br>"
                 f"<b>Experimental probability</b> = {frac('number of times it happened','number of trials')}. <b>Expected number</b> = probability × number of trials."), scale,
             box("example", "✏️ Worked example", f"Roll a fair dice. P(even) = {frac(3,6)} = {frac(1,2)} because 2, 4, 6 are even out of 6 outcomes."),
             "<h2>Sample space: two dice added together</h2>", dice,
             "<div style='font-size:9pt;text-align:center;color:#6b7280'>36 equally likely outcomes. Use this table for questions 4–6.</div>"]
    cnt = lambda f: sum(1 for i in range(1, 7) for j in range(1, 7) if f(i + j))
    fr = lambda a, b: str(Fraction(a, b)) if Fraction(a, b).denominator != 1 else str(Fraction(a, b))
    fa = lambda a, b: f"{a}/{b}" + (f" = {Fraction(a,b).numerator}/{Fraction(a,b).denominator}" if math.gcd(a, b) > 1 else "")
    secs = [
        ("A. Single events", [
            ("A fair dice is rolled. Find P(a prime number).", A(f"Primes are 2, 3, 5 → {fa(3,6)}")),
            ("A bag has 3 red, 5 blue and 2 green counters. One is picked at random. Find P(blue).", A(f"5 blue out of 10 → {fa(5,10)}")),
            ("Using the spinner picture, find P(yellow) and P(red or blue).", A(f"P(yellow) = {fa(2,8)}; P(red or blue) = {fa(4,8)}")),
        ]),
        ("B. Two dice (use the sample space table)", [
            ("How many outcomes give a total of 7? Find P(total 7).", A(f"{cnt(lambda s: s==7)} outcomes → {fa(6,36)}")),
            ("Find P(total of 10 or more).", A(f"10:3, 11:2, 12:1 → {cnt(lambda s: s>=10)} outcomes → {fa(cnt(lambda s: s>=10),36)}")),
            ("Find P(total of 1).", A("0 – it is impossible (the smallest total is 2)")),
        ]),
        ("C. Experimental probability", [
            ("A dice is rolled 50 times and a six comes up 8 times. Find the experimental probability of a six.", A("8 ÷ 50 = 0.16")),
            ("A fair dice is rolled 120 times. How many sixes would you expect?", A("1/6 × 120 = 20")),
            ("A coin is flipped 40 times and lands on heads 26 times. Is the coin definitely unfair? Explain.", A("Not definitely – 20 heads is expected, 26 is a bit high but could happen by chance. Flip more times to be surer.")),
        ]),
        ("D. Listing outcomes", [
            ("A coin is flipped and a dice is rolled. List all the possible outcomes (e.g. H1). How many are there?", A("H1 H2 H3 H4 H5 H6 T1 T2 T3 T4 T5 T6 → 12 outcomes")),
            ("From your list, find P(heads and an even number).", A("H2, H4, H6 → 3/12 = 1/4")),
        ]),
        ("⭐ Challenge", [
            ("A bag has red and blue counters only. P(red) = 0.4 and there are 12 blue. How many counters are in the bag?", A("P(blue) = 0.6, so 12 is 60% → total = 20")),
            ("Two fair dice are rolled. Which total is most likely and what is its probability?", A("7 is the most likely: 6/36 = 1/6")),
        ], "challenge"),
    ]
    return dict(slug="probability-and-sample-space", title="Probability & Sample Space", topic="Probability", difficulty="Medium", unit="Unit 4 · Data & Probability",
                intro=intro, sections=secs, desc="Learn the probability scale, calculate theoretical and experimental probability and use sample-space tables for two dice.")


ALL = [percentages, sdt, equations, angles, pythag, averages, probability]

if __name__ == "__main__":
    for f in ALL:
        build(f(), OUT)
