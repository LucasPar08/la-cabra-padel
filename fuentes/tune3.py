import sys, json
s = open('nuevo.html', encoding='utf-8').read(); v = json.loads(sys.argv[2])
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:60]; s = s.replace(a, b)
rep("sim:3.4, eleccion:.142", "sim:%s, eleccion:.142" % v['sim'])
rep("const ESCALA_RK = 1.36;", "const ESCALA_RK = %s;" % v['escala'])
open(sys.argv[1], 'w', encoding='utf-8').write(s)
