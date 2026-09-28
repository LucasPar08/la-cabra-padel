import sys, re, colorsys
# Novena pasada: dos temas. "Día de pista" (claro, por defecto) y el oscuro de
# siempre. No se reescribe ningún selector: cada color de la interfaz que cambia
# entre temas pasa a ser una variable, con su valor oscuro en :root y el claro en
# html[data-tema="claro"]. Así la cascada del CSS queda exactamente igual y
# cambiar de tema es cambiar un atributo. La pista, las banderas, los monumentos,
# las cartas de jugador y lo que se pinta encima de la pista no cambian nunca.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── la paleta clara: pareja nueva de cada color viejo ──
EXACTOS = {
  '#08191C':'#EEF1FF', '#0E2A2E':'#FFFFFF', '#143439':'#F4F6FF',
  '#DEEDE9':'#0E1330', '#AECAC5':'#3A4270', '#87A8A3':'#646C94',
  '#22D3A5':'#3D4BFF', '#0E9B78':'#2B37D9', '#03211A':'#FFFFFF',
  '#9B87FF':'#7C4DFF', '#F0A03C':'#C25E00', '#4FC3F7':'#0077B6',
  '#93A7BC':'#6B7A90', '#3AD98F':'#0A8A4F', '#29B6F6':'#0077B6',
  '#F075C0':'#D6246E', '#F5C542':'#A86A00', '#43CE84':'#0A8A4F',
  '#FF6B6B':'#D42941', '#DCF54A':'#C6F000', '#FF8A7A':'#D42941',
  '#FCA5A5':'#D42941', '#1A2600':'#1A2600', '#2A1D00':'#FFFFFF',
}
def fmt(x): return ('%.3f' % x).rstrip('0').rstrip('.') if x < 1 else '1'
RGBA_FAMILIAS = {
  (34,211,165):  lambda a: 'rgba(61,75,255,%s)' % a,        # acento → azul eléctrico
  (110,215,195): lambda a: 'rgba(61,75,255,%s)' % a,        # bordes verdosos → azulados
  (255,255,255): lambda a: 'rgba(14,19,48,%s)' % fmt(float(a)*.55),   # brillo blanco → tinta
  (0,0,0):       lambda a: 'rgba(14,19,48,%s)' % fmt(float(a)*.42),   # sombras más suaves
  (245,197,66):  lambda a: 'rgba(168,106,0,%s)' % a,        # oro
  (5,18,20):     lambda a: 'rgba(238,241,255,%s)' % a,      # fondo de página translúcido
  (8,25,28):     lambda a: 'rgba(238,241,255,%s)' % a,
  (67,206,132):  lambda a: 'rgba(10,138,79,%s)' % a,        # bien
  (255,107,107): lambda a: 'rgba(212,41,65,%s)' % a,        # peligro
  (220,245,74):  lambda a: 'rgba(150,190,0,%s)' % a,        # pelota
}
def hex3a6(h): return '#' + ''.join(c*2 for c in h[1:]) if len(h) == 4 else h
def a_hex(r, g, b): return '#%02X%02X%02X' % (round(r*255), round(g*255), round(b*255))
def general(h):
    """Lo que no está en el mapa: lo oscuro se aclara, lo claro y apagado se vuelve tinta."""
    h = hex3a6(h).upper()
    r, g, b = (int(h[i:i+2], 16)/255 for i in (1, 3, 5))
    hh, l, ss = colorsys.rgb_to_hls(r, g, b)
    if l < .22:
        return a_hex(*colorsys.hls_to_rgb(hh, .96 - l*.25, min(ss, .6)))
    if l > .78 and ss < .45:
        return a_hex(*colorsys.hls_to_rgb(hh if ss > .1 else .64, .14 + (1-l)*.9, max(ss*.5, .35)))
    if l > .62:
        return a_hex(*colorsys.hls_to_rgb(hh, .40, ss))
    return h
def claro_de(c):
    if c.startswith('#'):
        k = hex3a6(c).upper()
        return EXACTOS.get(k) or general(c)
    nums = re.findall(r'[\d.]+', c)
    if len(nums) >= 3:
        rgb = tuple(int(float(x)) for x in nums[:3])
        a = nums[3] if len(nums) > 3 else '1'
        if rgb in RGBA_FAMILIAS: return RGBA_FAMILIAS[rgb](a)
    return c

COLOR = re.compile(r'#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba?\([^)]*\)')
SE_QUEDA = re.compile(r'#juego\b|#lienzo\b|#\w+P\b|\.zleer|\.casilla|\.golpe-rafaga|\.pista-leer|\.carta\b|\.carta[-.]')
FOTOGRAMA = re.compile(r'^\s*(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*\s*$')

variables = {}            # (oscuro, claro) → nombre
raiz_clara = []           # la paleta de :root, en claro
def var_para(osc, cla):
    k = (osc, cla)
    if k not in variables: variables[k] = '--t%d' % (len(variables) + 1)
    return variables[k]

def convertir_regla(m):
    sel, cuerpo = m.group(1), m.group(2)
    if sel.strip() == ':root':
        limpio = re.sub(r'/\*.*?\*/', '', cuerpo, flags=re.S)
        for d in limpio.split(';'):
            if ':' not in d: continue
            k, v = d.split(':', 1)
            k = k.strip()
            if not k.startswith('--'): continue
            v2 = COLOR.sub(lambda c: claro_de(c.group(0)), v)
            if v2 != v: raiz_clara.append('%s:%s' % (k, v2.strip()))
        return m.group(0)
    if SE_QUEDA.search(sel) or FOTOGRAMA.match(sel): return m.group(0)
    def sub(c):
        lit = c.group(0); nuevo = claro_de(lit)
        return lit if nuevo == lit else 'var(%s)' % var_para(lit, nuevo)
    return sel + '{' + COLOR.sub(sub, cuerpo) + '}'

def tratar_css(m):
    return m.group(1) + re.sub(r'([^{}]*)\{([^{}]*)\}', convertir_regla, m.group(2)) + m.group(3)
s, n = re.subn(r'(<style[^>]*>)(.*?)(</style>)', tratar_css, s, flags=re.S)
assert n >= 1, 'no hay hojas de estilo'

# ── las variables de los dos temas, y los retoques que sólo tiene el claro ──
C = 'html[data-tema="claro"]'
TEMAS = (':root{' + ';'.join('%s:%s' % (nombre, osc) for (osc, cla), nombre in variables.items()) + ';--tu:var(--pelota)}\n'
         + C + '{' + ';'.join(raiz_clara + ['%s:%s' % (nombre, cla) for (osc, cla), nombre in variables.items()])
         + ';--tu:#E0246A;--rosa:#FF3D7F}\n')
RETOQUES = f'''
/* ═══ TEMA "DÍA DE PISTA": lo que la regla general no puede adivinar ═══ */
{C} .eyebrow{{color:#E0246A}}
{C} .btn.btn-jugar{{background:linear-gradient(180deg,#4F5CFF,#2F3CE6);color:#FFFFFF;box-shadow:0 10px 26px rgba(61,75,255,.32)}}
{C} .hero-logo span{{background:linear-gradient(100deg,#0E1330 20%,#3D4BFF 45%,#0E1330 70%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}}
{C} .hero-logo b{{color:#E0246A}}
{C} .hero-texto{{background:#FFFFFF}}
.rk-fila.tu .rk-n,.ll-yo,.mc-eq.mio span{{color:var(--tu)}}
{C} .des-ico{{background:rgba(61,75,255,.1);color:var(--accent)}}
{C} .desafio{{border-color:rgba(61,75,255,.28);background:linear-gradient(150deg,rgba(61,75,255,.08),transparent 55%),var(--card-bg)}}
{C} .desafio.hecho{{border-color:rgba(10,138,79,.35);background:linear-gradient(150deg,rgba(10,138,79,.08),transparent 55%),var(--card-bg)}}
{C} .card{{box-shadow:0 1px 2px rgba(14,19,48,.05),0 6px 18px rgba(61,75,255,.06)}}
'''
s = s.replace('<style>', '<style>\n' + TEMAS, 1)
s = s.replace('</style>', RETOQUES + '</style>', 1)

# ── que se pinte ya con el tema bueno, sin parpadeo: antes de la hoja de estilo.
#    Lleva atributo a propósito: las pruebas buscan el primer "<script>" pelado.
rep('<style>', '''<script data-tema-inicial>try{var p=JSON.parse(localStorage.getItem('cabra_circuito_pref_v1')||'{}');document.documentElement.setAttribute('data-tema',p.tema==='oscuro'?'oscuro':'claro')}catch(e){document.documentElement.setAttribute('data-tema','claro')}</script>
<style>''')

# ── las gráficas: el recorte de los puntos y el contorno punteado, según el tema ──
rep('stroke="#0E2A2E"', 'style="stroke:var(--card-bg)"', 2)
rep('stroke="#AECAC5"', 'style="stroke:var(--text-2)"')

# ── el tema se aplica en cada pintado, y se cambia desde arriba o desde Cómo se juega ──
rep("function render(){\n  const p = S.pantalla;", "function render(){\n  aplicarTema();\n  const p = S.pantalla;")
rep("""<div class="brand"><span class="pala"></span><b>LA CABRA</b><small>PÁDEL</small></div>`;""",
    """<div class="brand"><span class="pala"></span><b>LA CABRA</b><small>PÁDEL</small></div>${botonTema()}`;""")
rep("  ${aspectoHTML()}\n", "  ${temaHTML()}\n\n  ${aspectoHTML()}\n")

open(p, 'w', encoding='utf-8').write(s)
print('dos temas: %d colores con variable, claro por defecto' % len(variables))
