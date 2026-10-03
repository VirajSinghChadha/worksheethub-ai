import math
from fractions import Fraction
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle
from engine import *

OUT = "/Users/suminsethi/Desktop/claude folder/WorksheetHub AI/worksheets/math/grade7"
A = lambda t: f'<span class="a">{t}</span>'


def is_prime(n):
    return n > 1 and all(n % i for i in range(2, int(n ** .5) + 1))


def factorise(n):
    f, d = {}, 2
    while n > 1:
        while n % d == 0:
            f[d] = f.get(d, 0) + 1
            n //= d
        d += 1
    return f


def prod_str(n, html_=True):
    f = factorise(n)
    return " × ".join(f"{p}{sup(e) if e > 1 else ''}" for p, e in f.items())


# ---------------------------------------------------------------- 1. Number types
def number_types():
    fig, ax = plt.subplots(figsize=(7.2, 3.1))
    ax.set_xlim(0, 10); ax.set_ylim(0, 5); ax.axis("off")
    for n in range(1, 51):
        r, c = (n - 1) // 10, (n - 1) % 10
        col = "#e5e7eb" if n == 1 else ("#2563eb" if is_prime(n) else "#bfdbfe")
        ax.add_patch(Rectangle((c + .04, 4 - r + .04), .92, .92, color=col))
        ax.text(c + .5, 4 - r + .5, n, ha="center", va="center", fontsize=11, color="white" if is_prime(n) else "#1f2937", fontweight="bold" if is_prime(n) else "normal")
    ax.text(10.1, 4.5, "", fontsize=8)
    grid = fig_html(fig, "Dark blue = PRIME · Light blue = COMPOSITE · Grey = 1 (neither)")
    fig2, ax2 = plt.subplots(figsize=(7.2, 1.9)); ax2.set_xlim(0, 21); ax2.set_ylim(-.5, 4.3); ax2.axis("off"); ax2.set_aspect("equal")
    x = 0.4
    for n in range(1, 6):
        for row in range(n):
            for k in range(n - row):
                ax2.add_patch(Circle((x + k * .75, row * .75 + .4), .3, color="#2563eb"))
        ax2.text(x + (n - 1) * .375, -.25, f"T{n} = {n*(n+1)//2}", ha="center", fontsize=9.5)
        x += n * .75 + 1.6
    tri = fig_html(fig2, "Triangular numbers: the dots make a triangle")
    intro = [
        box("remember", "🔎 Remember", "<b>Even</b> numbers end in 0, 2, 4, 6, 8. <b>Odd</b> numbers end in 1, 3, 5, 7, 9.<br>"
            "<b>Prime</b> = exactly <b>2 factors</b> (1 and itself). <b>Composite</b> = <b>more than 2 factors</b>. The number <b>1</b> is neither.<br>"
            "<b>Triangular</b> numbers: 1, 3, 6, 10, 15, 21… (add 1, then 2, then 3, then 4…)"),
        grid, tri,
        box("tip", "💡 Quick test", "Is it prime? Try dividing by 2, 3, 5, 7. If none divide exactly, it is prime (for numbers under 100)."),
    ]
    odd_even = [37, 128, 405, 66, 1001, 3240]
    cls = [1, 2, 9, 13, 21, 29, 35, 51, 53, 91]
    lab = lambda n: "Neither" if n == 1 else ("Prime" if is_prime(n) else "Composite")
    tri_pick = [21, 24, 36, 40, 45, 55]
    isT = lambda n: any(k * (k + 1) // 2 == n for k in range(1, 20))
    secs = [
        ("A. Odd or even?", [(f"Is <b>{n}</b> odd or even?", A(f"{n} is " + ("even" if n % 2 == 0 else "odd"))) for n in odd_even], "", "cols"),
        ("B. Prime, composite or neither?", [(f"<b>{n}</b>", A(f"{n}: {lab(n)}" + ("" if n == 1 else (" (only factors 1 and %d)" % n if is_prime(n) else " (factors: " + ", ".join(str(d) for d in range(1, n + 1) if n % d == 0) + ")")))) for n in cls], "", "cols"),
        ("C. Triangular numbers", [
            ("Write the first 8 triangular numbers.", A("1, 3, 6, 10, 15, 21, 28, 36")),
            ("Which of these are triangular? &nbsp; 21, 24, 36, 40, 45, 55", A(", ".join(str(n) for n in tri_pick if isT(n)) + " are triangular (24 and 40 are not)")),
            ("What is the 10th triangular number? (Hint: add 1+2+3+…+10)", A("55")),
        ]),
        ("D. Problem solving", [
            ("List all the prime numbers between 20 and 50.", A(", ".join(str(n) for n in range(20, 51) if is_prime(n)))),
            ("Write down all the factors of 36. Is 36 prime or composite?", A("1, 2, 3, 4, 6, 9, 12, 18, 36 → composite")),
            ("2 is the only even prime number. Explain why no other even number can be prime.", A("Every other even number can be divided by 2, so it has at least 3 factors (1, 2 and itself).")),
        ]),
        ("⭐ Challenge", [
            ("I am a prime number between 30 and 40. The digits of my number add up to 4. What number am I?", A("31 (3+1 = 4 and 31 is prime)")),
            ("Write 20 as the sum of two different prime numbers in two ways.", A("3 + 17 and 7 + 13")),
            ("Find a number that is both a triangular number and a square number, other than 1.", A("36 (T8 = 36 = 6²)")),
        ], "challenge"),
    ]
    return dict(slug="number-types-primes-triangular", title="Odd, Even, Prime, Composite & Triangular Numbers", topic="Number sets & types of number", difficulty="Easy", unit="Unit 1 · Number",
                intro=intro, sections=secs,
                desc="Learn to classify numbers as odd, even, prime, composite or triangular, with a prime-number grid and dot diagrams.")


# ---------------------------------------------------------------- 2. Squares & cubes
def squares_cubes():
    fig, ax = plt.subplots(figsize=(7.2, 1.9)); ax.set_xlim(0, 24); ax.set_ylim(-1, 5.4); ax.axis("off"); ax.set_aspect("equal")
    x = 0
    for n in range(1, 6):
        for i in range(n):
            for j in range(n):
                ax.add_patch(Rectangle((x + i * .8, j * .8), .72, .72, color="#2563eb", alpha=.85))
        ax.text(x + n * .4, -.8, f"{n}² = {n*n}", ha="center", fontsize=10.5)
        x += n * .8 + 1.2
    sq = fig_html(fig, "Square numbers make a square of dots")
    fig2, ax2 = plt.subplots(figsize=(3.6, 2.2)); ax2.axis("off"); ax2.set_aspect("equal")
    # 3x3x3 cube drawn as stacked squares with offset
    for k in range(3):
        for i in range(3):
            for j in range(3):
                ax2.add_patch(Rectangle((i + k * .35, j + k * .35), .95, .95, fc="#bfdbfe", ec="#1e40af", lw=.6, alpha=1, zorder=3 - k))
    ax2.autoscale_view(); ax2.set_xlim(-.2, 4.4); ax2.set_ylim(-.2, 4.4)
    cube = fig_html(fig2, "3³ = 3 × 3 × 3 = 27 small cubes")
    tbl = "<table class='t'><tr><th>n</th>" + "".join(f"<th>{n}</th>" for n in range(1, 11)) + "</tr><tr><th>n²</th>" + "".join(f"<td>{n*n}</td>" for n in range(1, 11)) + "</tr><tr><th>n³</th>" + "".join(f"<td>{n**3}</td>" for n in range(1, 5)) + "".join("<td>–</td>" for _ in range(6)) + "</tr></table>"
    intro = [box("remember", "🔎 Remember", f"A <b>square number</b> is a number × itself: 5² = 5 × 5 = 25.<br>A <b>cube number</b> is a number × itself × itself: 4³ = 4 × 4 × 4 = 64.<br>"
                 "The <b>square root</b> (√) undoes squaring: √25 = 5. The <b>cube root</b> (∛) undoes cubing: ∛64 = 4."),
             sq, f'<div style="display:grid;grid-template-columns:1.2fr 1fr;align-items:center">{tbl}{cube}</div>',
             box("example", "✏️ Worked example", "Find the side of a square with area 49 cm².<br>Side = √49 = <b>7 cm</b> (because 7 × 7 = 49).")]
    sqs = [(6, 2), (9, 2), (12, 2), (15, 2), (2, 3), (3, 3), (5, 3), (10, 3)]
    roots = [("√81", 9), ("√144", 12), ("√100", 10), ("∛8", 2), ("∛27", 3), ("∛125", 5)]
    secs = [
        ("A. Squares and cubes", [(f"{b}{sup(p)} = ?", A(f"{b}{sup(p)} = {b**p}")) for b, p in sqs], "", "cols"),
        ("B. Roots", [(t, A(f"{t} = {v}")) for t, v in roots], "", "cols"),
        ("C. Spot the numbers", [
            ("Circle the square numbers: &nbsp; 16, 20, 25, 30, 36, 45, 64", A("16, 25, 36, 64")),
            ("List all the cube numbers up to 100.", A("1, 8, 27, 64")),
            ("Fill in: 8² = ___ &nbsp;&nbsp; ___² = 121 &nbsp;&nbsp; 4³ = ___ &nbsp;&nbsp; ___³ = 216", A("64, 11, 64, 6")),
        ]),
        ("D. Real-life problems", [
            ("A square garden has an area of 81 m². How long is each side?", A("√81 = 9 m")),
            ("A cube-shaped box has a volume of 64 cm³. How long is each edge?", A("∛64 = 4 cm")),
            ("A square patio is made of 144 square tiles. How many tiles are along one side?", A("√144 = 12 tiles")),
        ]),
        ("⭐ Challenge", [
            ("Which number under 100 is <b>both</b> a square number and a cube number? (Not 1)", A("64 (8² = 64 and 4³ = 64)")),
            ("Calculate: 3² + 4² and compare with 5². What do you notice?", A("9 + 16 = 25 = 5² – it is a Pythagorean triple!")),
        ], "challenge"),
    ]
    return dict(slug="squares-cubes-and-roots", title="Square Numbers, Cube Numbers & Roots", topic="Squares, cubes and roots", difficulty="Easy", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Understand squares, cubes and their roots using dot-square pictures, a cheat-sheet table and real-life problems.")


# ---------------------------------------------------------------- 3. Directed numbers
def directed():
    fig, ax = plt.subplots(figsize=(7.2, 1.7)); ax.set_xlim(-8.6, 8.6); ax.set_ylim(-1.6, 1.7); ax.axis("off")
    ax.annotate("", xy=(8.4, 0), xytext=(-8.4, 0), arrowprops=dict(arrowstyle="<|-|>", color="#1f2937"))
    for n in range(-8, 9):
        ax.plot([n, n], [-.12, .12], color="#1f2937"); ax.text(n, -.55, n, ha="center", fontsize=10, color="#dc2626" if n < 0 else "#1f2937")
    ax.annotate("", xy=(2, .55), xytext=(-3, .55), arrowprops=dict(arrowstyle="-|>", color="#2563eb", lw=2.2))
    ax.text(-.5, 1.05, "start at −3, move +5, land on 2", ha="center", fontsize=10.5, color="#1e40af")
    nl = fig_html(fig, "Adding moves RIGHT →, subtracting moves LEFT ←")
    intro = [box("remember", "🔎 Remember", "Positive numbers (+) are above zero. Negative numbers (−) are below zero.<br>"
                 "<b>Adding a negative</b> is the same as subtracting: 5 + (−2) = 5 − 2 = 3.<br>"
                 "<b>Subtracting a negative</b> is the same as adding: 5 − (−2) = 5 + 2 = 7."), nl,
             "<div class='cards'><div class='card'><b>Multiply / divide</b>same signs → <b>positive</b><br>(−)×(−) = +, (+)×(+) = +</div><div class='card'><b>Multiply / divide</b>different signs → <b>negative</b><br>(−)×(+) = −, (+)×(−) = −</div><div class='card'><b>Tip</b>Use the number line or think of money: owing £5 is −5.</div></div>"]
    add = ["-5 + 8", "4 - 9", "-6 - (-2)", "-3 + (-7)", "-10 + 10", "2 - (-6)", "-9 + 4", "-1 - 5"]
    mul = ["-4 * 6", "-8 * -3", "7 * -5", "24 / -6", "-45 / -9", "-36 / 4"]
    show = lambda e: e.replace("*", "×").replace("/", "÷").replace("-", "−").replace("−−", "− −")
    fmt = lambda e: show(e).replace("(−", "(−")
    res = lambda e: int(eval(e))
    secs = [
        ("A. Add and subtract", [(f"{fmt(e)} = ?", A(f"{fmt(e)} = {str(res(e)).replace('-', '−')}")) for e in add], "", "cols"),
        ("B. Multiply and divide", [(f"{fmt(e)} = ?", A(f"{fmt(e)} = {str(res(e)).replace('-', '−')}")) for e in mul], "", "cols"),
        ("C. Order of operations", [
            ("3 + (−2) × 4 = ?", A("Multiply first: (−2) × 4 = −8, then 3 + (−8) = −5")),
            ("(−5 + 2) × (−3) = ?", A("Brackets first: −3 × −3 = 9")),
            ("10 − 3 × (−2) = ?", A("3 × (−2) = −6, then 10 − (−6) = 16")),
        ]),
        ("D. Real-life problems", [
            ("The temperature at night is −4 °C. By midday it rises by 11 °C. What is the temperature at midday?", A("−4 + 11 = 7 °C")),
            ("A lift starts in the basement at level −3 and goes up 8 floors. Which level does it reach?", A("−3 + 8 = level 5")),
            ("Sam has $20 and owes his friend $35. What is his total money? Write it as a directed number.", A("20 − 35 = −$15 (he owes $15)")),
            ("A submarine at −120 m dives a further 45 m. How deep is it now?", A("−120 − 45 = −165 m")),
        ]),
        ("⭐ Challenge", [
            ("Find two numbers that multiply to give −12 and add to give 1.", A("4 and −3 (4 × −3 = −12, 4 + −3 = 1)")),
            ("The temperature on Monday was −3 °C. On Tuesday it was 5 degrees colder, on Wednesday 9 degrees warmer. What was Wednesday’s temperature?", A("−3 − 5 = −8, then −8 + 9 = 1 °C")),
        ], "challenge"),
    ]
    return dict(slug="directed-numbers", title="Directed Numbers (Positive & Negative)", topic="Directed numbers", difficulty="Easy", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Add, subtract, multiply and divide positive and negative numbers with a number line and real-life problems.")


# ---------------------------------------------------------------- 4. Primes, HCF, LCM
def factor_tree(n, ax, x, y, dx):
    f = [p for p in range(2, n) if n % p == 0]
    if is_prime(n):
        ax.add_patch(Circle((x, y), .42, color="#2563eb")); ax.text(x, y, n, ha="center", va="center", color="white", fontweight="bold", fontsize=11)
        return
    a = f[0]; b = n // a
    ax.add_patch(Circle((x, y), .42, fc="#dbeafe", ec="#1e40af")); ax.text(x, y, n, ha="center", va="center", fontsize=11)
    for c, xx in ((a, x - dx), (b, x + dx)):
        ax.plot([x, xx], [y - .42, y - 1.58], color="#6b7280", lw=1.2)
        factor_tree(c, ax, xx, y - 2, dx / 2)


def hcf_lcm():
    fig, ax = plt.subplots(figsize=(5.4, 3.2)); ax.set_xlim(-4.5, 4.5); ax.set_ylim(-4.6, 1); ax.axis("off"); ax.set_aspect("equal")
    factor_tree(60, ax, 0, 0, 2.2)
    ax.text(0, -4.2, "60 = 2 × 2 × 3 × 5 = 2² × 3 × 5", ha="center", fontsize=11, color="#1e40af")
    tree = fig_html(fig, "A factor tree: keep splitting until every branch ends in a prime (dark blue)")
    intro = [box("remember", "🔎 Remember", "<b>Factors</b> divide exactly into a number. <b>Multiples</b> are in its times table.<br>"
                 "<b>HCF</b> (Highest Common Factor) = the biggest number that divides into both.<br><b>LCM</b> (Lowest Common Multiple) = the smallest number in both times tables."), tree,
             box("example", "✏️ Worked example: HCF and LCM of 12 and 18",
                 "Factors of 12: 1, 2, 3, <b>4</b>, <b>6</b>, 12 &nbsp;|&nbsp; Factors of 18: 1, 2, 3, 6, 9, 18 → common: 1, 2, 3, 6 → <b>HCF = 6</b><br>"
                 "Multiples of 12: 12, 24, <b>36</b>… &nbsp;|&nbsp; Multiples of 18: 18, <b>36</b>… → <b>LCM = 36</b>")]
    pairs = [(12, 18), (24, 36), (15, 20), (16, 40)]
    secs = [
        ("A. Write as a product of prime factors", [(f"Write <b>{n}</b> as a product of primes.", A(f"{n} = {prod_str(n)}")) for n in (36, 48, 90, 100)], "", "cols"),
        ("B. HCF and LCM", [(f"Find the HCF and LCM of <b>{a}</b> and <b>{b}</b>.", A(f"HCF = {math.gcd(a, b)}, LCM = {a*b//math.gcd(a, b)}")) for a, b in pairs]),
        ("C. Word problems", [
            ("Bus A leaves the station every 12 minutes. Bus B leaves every 18 minutes. They both leave at 8:00. When do they next leave together?", A("LCM(12, 18) = 36 → at 8:36")),
            ("A teacher has 24 pencils and 36 erasers. She makes identical packs using all of them. What is the greatest number of packs she can make? How many of each item are in a pack?", A("HCF(24, 36) = 12 packs, each with 2 pencils and 3 erasers")),
            ("Two lights flash every 8 s and every 20 s. They flash together now. After how many seconds will they flash together again?", A("LCM(8, 20) = 40 seconds")),
        ]),
        ("⭐ Challenge", [
            ("The HCF of two numbers is 5 and their LCM is 60. One number is 15. What is the other?", A("Product of the numbers = HCF × LCM = 300, so 300 ÷ 15 = 20")),
            ("Find the smallest number that is divisible by 2, 3, 4, 5 and 6.", A("LCM = 60")),
        ], "challenge"),
    ]
    return dict(slug="prime-factors-hcf-lcm", title="Prime Factors, HCF & LCM", topic="Factors, multiples, HCF and LCM", difficulty="Medium", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Use factor trees to write numbers as products of primes, then find HCF and LCM and solve word problems.")


# ---------------------------------------------------------------- 5. Indices
def indices():
    cards = ("<div class='cards'>"
             f"<div class='card'><b>Multiply</b>a{sup('m')} × a{sup('n')} = a{sup('m+n')}<br>2{sup(3)}×2{sup(2)} = 2{sup(5)}</div>"
             f"<div class='card'><b>Divide</b>a{sup('m')} ÷ a{sup('n')} = a{sup('m−n')}<br>5{sup(6)}÷5{sup(2)} = 5{sup(4)}</div>"
             f"<div class='card'><b>Power of a power</b>(a{sup('m')}){sup('n')} = a{sup('m×n')}<br>(3{sup(2)}){sup(3)} = 3{sup(6)}</div>"
             f"<div class='card'><b>Power of zero</b>a{sup(0)} = 1<br>9{sup(0)} = 1</div>"
             f"<div class='card'><b>Negative power</b>a{sup('−n')} = {frac(1, 'a'+sup('n'))}<br>2{sup('−3')} = {frac(1, 8)}</div>"
             f"<div class='card'><b>Power of one</b>a{sup(1)} = a<br>7{sup(1)} = 7</div></div>")
    intro = [box("remember", "🔎 Remember", f"An <b>index</b> (or power) tells you how many times to multiply a number by itself. In 2{sup(5)}, the base is 2 and the index is 5: 2 × 2 × 2 × 2 × 2 = 32."),
             "<h2>The index laws</h2>", cards,
             box("tip", "💡 Watch out", "The laws for multiplying and dividing only work when the <b>bases are the same</b>.")]
    T = lambda b, e: f"{b}{sup(e)}"
    secs = [
        ("A. Multiply and divide (write as a single power)", [
            (f"{T(3,5)} × {T(3,2)}", A(f"{T(3,7)}")), (f"{T(5,8)} ÷ {T(5,3)}", A(f"{T(5,5)}")),
            (f"x{sup(4)} × x{sup(6)}", A(f"x{sup(10)}")), (f"y{sup(9)} ÷ y{sup(4)}", A(f"y{sup(5)}")),
            (f"{T(7,3)} × {T(7,1)}", A(f"{T(7,4)}")), (f"a{sup(2)} × a{sup(3)} × a{sup(4)}", A(f"a{sup(9)}"))], "", "cols"),
        ("B. Power of a power", [(f"({T(2,3)}){sup(4)}", A(f"{T(2,12)}")), (f"(m{sup(2)}){sup(5)}", A(f"m{sup(10)}")), (f"({T(10,2)}){sup(3)}", A(f"{T(10,6)}"))], "", "cols"),
        ("C. Zero and negative powers", [
            (f"{T(9,0)} = ?", A("1")), (f"{T(4,0)} + {T(3,0)} = ?", A("1 + 1 = 2")),
            (f"{T(2,'−3')} = ? (write as a fraction)", A(f"{frac(1, 8)}")), (f"{T(10,'−2')} = ? (write as a fraction)", A(f"{frac(1, 100)}"))], "", "cols"),
        ("D. Calculate", [(f"{T(2,3)} × {T(2,2)} = ? (give the number)", A("2⁵ = 32")), (f"{T(10,6)} ÷ {T(10,4)} = ? (give the number)", A("10² = 100")), (f"({T(3,2)}){sup(2)} = ?", A("3⁴ = 81"))]),
        ("⭐ Challenge", [
            (f"Find x: &nbsp; 2{sup('x')} = 64", A("2⁶ = 64, so x = 6")),
            (f"Simplify {frac('3'+sup(4)+' × 3'+sup(2), '3'+sup(3))}", A(f"3{sup(6)} ÷ 3{sup(3)} = 3{sup(3)} = 27")),
            (f"Which is bigger: 2{sup(10)} or 10{sup(2)}? Show your working.", A("2¹⁰ = 1024 and 10² = 100, so 2¹⁰ is bigger")),
        ], "challenge"),
    ]
    return dict(slug="indices-laws-of-powers", title="Indices: The Laws of Powers", topic="Indices", difficulty="Medium", unit="Unit 1 · Number",
                intro=intro, sections=secs, desc="Master the index laws: multiplying, dividing, power of a power, zero and negative powers.")


ALL = [number_types, squares_cubes, directed, hcf_lcm, indices]

if __name__ == "__main__":
    import sys
    for f in ALL:
        build(f(), OUT)
