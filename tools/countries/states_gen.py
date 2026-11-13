"""Converte le festività degli stati (libreria open source "holidays") nelle regole dell'app.
Uso: git clone --depth 1 https://github.com/vacanza/holidays /percorso/holidays
     python3 -I tools/countries/states_gen.py /percorso/holidays US   (poi BR)
Scrive OUT/rules_XX.json (regole) e OUT/expected_XX.json (date attese, per tests/holidays-states.js);
OUT è la variabile d'ambiente OUT o /tmp/myturn-tests. Poi states_emit.py crea states.py."""
import sys, os, json, datetime as dt, importlib.metadata as md
_v = md.version
md.version = lambda n: "0.0" if n == "holidays" else _v(n)
sys.path.insert(0, sys.argv[1])
import holidays
OUTD = os.environ.get("OUT", "/tmp/myturn-tests"); os.makedirs(OUTD, exist_ok=True)
from dateutil.easter import easter as _easter

C = sys.argv[2]
Y = list(range(2024, 2061))
D = dt.date

# commemorazioni o festività facoltative senza chiusura degli uffici: escluse
EXCL = {
    "US": {"*": {"Susan B. Anthony Day", "Diwali"}, "CO": {"Cesar Chavez Day"}, "TX": {"Cesar Chavez Day", "Good Friday"}},
    "BR": {"*": set()},
}[C]
SKIP_SUB = {"US": {"AS", "GU", "MP", "PR", "UM", "VI"}, "BR": set()}[C]

def wd(d):  # 0 = domenica come in JS
    return (d.weekday() + 1) % 7

def rule_date(y, r):
    if r[0] == '?':
        md, w, rest = r[1:6], int(r[7]), r[9:]
        f = D(y, int(md[:2]), int(md[3:]))
        return f if wd(f) == w else rule_date(y, rest)
    if r[0] == 'e':
        return _easter(y) + dt.timedelta(days=int(r[1:]))
    if r[0] == 'n':
        mo, w, n = r[1:].split('/'); mo, w, n = int(mo), int(w), int(n)
        if n > 0:
            f = D(y, mo, 1); return f + dt.timedelta(days=(w - wd(f)) % 7 + 7 * (n - 1))
        l = (D(y, mo % 12 + 1, 1) if mo < 12 else D(y + 1, 1, 1)) - dt.timedelta(days=1)
        return l - dt.timedelta(days=(wd(l) - w) % 7)
    if r[0] in 'ab':
        md, w = r[1:].split('/'); m, d = md.split('-'); f = D(y, int(m), int(d)); w = int(w)
        return f + dt.timedelta(days=(w - wd(f)) % 7) if r[0] == 'a' else f - dt.timedelta(days=(wd(f) - w) % 7)
    m, d = r.split('-'); return D(y, int(m), int(d))

def candidates(d, y):
    c = [f"{d.month:02d}-{d.day:02d}", f"e{(d - _easter(y)).days}"]
    n = (d.day - 1) // 7 + 1; c.append(f"n{d.month:02d}/{wd(d)}/{n}"); c.append(f"n{d.month:02d}/{wd(d)}/-1")
    for k in range(0, 7):
        a = d - dt.timedelta(days=k); c.append(f"a{a.month:02d}-{a.day:02d}/{wd(d)}")
        b = d + dt.timedelta(days=k); c.append(f"b{b.month:02d}-{b.day:02d}/{wd(d)}")
    # Acre: dal martedì al giovedì si sposta al venerdì dopo
    for k in range(0, 4):
        a = d - dt.timedelta(days=k); md = f"{a.month:02d}-{a.day:02d}"
        c.append(f"?{md}/1:?{md}/6:?{md}/0:a{md}/5")
    return c

def years_opt(P):
    P = sorted(P)
    if P == Y: return {}
    if P == [y for y in Y if y % 2 == 0]: return {"ev": [2, 0]}
    if P == [y for y in Y if y % 4 == 1]: return {"ev": [4, 1]}
    if P == list(range(P[0], P[-1] + 1)):
        o = {}
        if P[0] > Y[0]: o["from_"] = P[0]
        if P[-1] < Y[-1]: o["to"] = P[-1]
        return o
    return None

def collect(sub):
    base, obs = {}, {}
    for y in Y:
        h = holidays.country_holidays(C, subdiv=sub, years=y)
        for d, names in sorted(h.items()):
            for n in names.split('; '):
                if n.endswith(' (observed)'):
                    obs.setdefault(n[:-11], {}).setdefault(y, []).append(d)
                else:
                    base.setdefault(n, {}).setdefault(y, []).append(d)
    return base, obs

def solve(sub, nat_names=None):
    base, obs = collect(sub)
    ex = EXCL.get("*", set()) | EXCL.get(sub, set())
    out, problems = [], []
    for name, per in base.items():
        if name in ex or (nat_names is not None and name in nat_names): continue
        m = max(len(v) for v in per.values())
        for k in range(m):
            P = [y for y in Y if y in per and len(per[y]) > k]
            dates = {y: sorted(per[y])[k] for y in P}
            yo = years_opt(P)
            rule = next((r for r in candidates(dates[P[0]], P[0]) if all(rule_date(y, r) == dates[y] for y in P)), None)
            if rule is None or yo is None:
                # regola irregolare: un elemento per anno
                for y in P:
                    out.append((f"{dates[y].month:02d}-{dates[y].day:02d}", name, {"from_": y, "to": y}))
                problems.append(f"{sub} {name}: per anno")
                continue
            o = dict(yo)
            ob = obs.get(name, {})
            if ob:
                modes = set()
                for y in P:
                    d = dates[y]; w = wd(d); od = ob.get(y, [])
                    prev = d - dt.timedelta(days=1)
                    if w == 6: modes.add('sat-' + ('fri' if prev in od or prev in ob.get(prev.year, []) else 'mon' if d + dt.timedelta(days=2) in od else 'none'))
                    if w == 0: modes.add('sun-' + ('mon' if d + dt.timedelta(days=1) in od else 'none'))
                if modes <= {'sat-fri', 'sun-mon'}: o["obs"] = "near"
                elif modes <= {'sat-none', 'sun-mon'}: o["obs"] = "sun"
                elif modes <= {'sat-fri', 'sun-none'}: o["obs"] = "sat"
                elif modes <= {'sat-mon', 'sun-mon'}: o["obs"] = "mon"
                else: problems.append(f"{sub} {name}: osservato {modes}")
            out.append((rule, name, o))
    out.sort(key=lambda x: (rule_date(2030 if 'from_' not in x[2] else x[2]['from_'], x[0]) if not x[0].startswith('e') else D(2030, 4, 1)))
    return out, problems

if __name__ == '__main__':
    subs = [s for s in getattr(holidays, C).subdivisions if s not in SKIP_SUB and len(s) <= 3]
    res, probs, expect = {}, [], {}
    nat = None
    if C == "BR":
        b, _ = collect(None); nat = set(b)
    for s in subs:
        r, p = solve(s, nat); res[s] = r; probs += p
        h = {}
        for y in Y:
            for d, names in holidays.country_holidays(C, subdiv=s, years=y).items():
                ns = [n for n in names.split('; ') if n.replace(' (observed)', '') not in (EXCL.get("*", set()) | EXCL.get(s, set()))]
                if ns: h[str(d)] = ns
        expect[s] = h
    json.dump(expect, open(os.path.join(OUTD, f'expected_{C}.json'), 'w'))
    json.dump({s: [[a, b, c] for a, b, c in v] for s, v in res.items()}, open(os.path.join(OUTD, f'rules_{C}.json'), 'w'), indent=0)
    print("\n".join(probs) or "nessun problema")
    print(sum(len(v) for v in res.values()), "regole per", len(res), "suddivisioni")
