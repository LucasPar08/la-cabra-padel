import sys, json
# variante del juego con otras perillas: python3 tune.py salida.html '{"sim":3,...}'
base = open('nuevo.html', encoding='utf-8').read()
v = json.loads(sys.argv[2])
def rep(s, a, b):
    assert s.count(a) == 1, a[:70]
    return s.replace(a, b)
s = base
s = rep(s, "rival:7,  cal:.07, alcance:.1,  sim:2.2, eleccion:.085, ayuda:{FIP1:3, FIP2:1.5, FIP3:.5, FIP4:0}",
        "rival:%s,  cal:.07, alcance:.1,  sim:%s, eleccion:%s, ayuda:%s" % (v['rival'], v['sim'], v['eleccion'], v['ayuda']))
if v.get('joven'):
    s = rep(s, "if(edad<20) return (-1.2 + (edad-17)*0.4) * (1 - prec);",
            "if(edad<21) return (%s + (edad-17)*%s) * (1 - prec);" % tuple(v['joven']))
s = rep(s, "const ESCALA_RK = 1.28;", "const ESCALA_RK = %s;" % v['escala'])
s = rep(s, "let libres = j.edad<=20 ? 7 : j.edad<=24 ? 6 : j.edad<=29 ? 4 : 3;",
        "let libres = j.edad<=20 ? %s : j.edad<=24 ? %s : j.edad<=29 ? %s : %s;" % tuple(v['libres']))
s = rep(s, "let tasa = j.edad<=20 ? .09 : j.edad<=23 ? .10 : j.edad<=27 ? .08 : j.edad<=31 ? .05 : 0;",
        "let tasa = j.edad<=20 ? %s : j.edad<=23 ? %s : j.edad<=27 ? %s : j.edad<=31 ? %s : 0;" % tuple(v['tasa']))
open(sys.argv[1], 'w', encoding='utf-8').write(s)
