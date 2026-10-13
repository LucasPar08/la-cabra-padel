import sys, json
# variante de dificultad sobre nuevo.html: python3 tune2.py salida.html '{"sim":5,"escala":1.5,"joven":[-4,1],"ayuda":[1,.5]}'
s = open('nuevo.html', encoding='utf-8').read(); v = json.loads(sys.argv[2])
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:60]; s = s.replace(a, b)
rep("sim:5.8, eleccion:.142", "sim:%s, eleccion:.142" % v['sim'])
rep("const ESCALA_RK = 1.34;", "const ESCALA_RK = %s;" % v['escala'])
rep("if(edad<21) return (-3.1 + (edad-17)*0.8)", "if(edad<21) return (%s + (edad-17)*%s)" % tuple(v['joven']))
rep("ayuda:{FIP1:1.35, FIP2:.7, FIP3:0, FIP4:0}", "ayuda:{FIP1:%s, FIP2:%s, FIP3:0, FIP4:0}" % tuple(v['ayuda']))
open(sys.argv[1], 'w', encoding='utf-8').write(s)
