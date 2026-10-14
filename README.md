# LA CABRA · Pádel

Juego de carrera de pádel en un solo archivo HTML, en español. Empiezas con 17 años en un club de barrio y peleas cada punto del ranking hasta la final de un Major.

**En vivo:** https://la-cabra-padel.vercel.app

## Qué tiene

- **Modo carrera.** Eliges tu país entre los 21 hispanohablantes, tu lado, tu estilo y tu pista favorita. El país no da ventaja: todas las carreras empiezan igual.
- **Se empieza desde abajo.** Antes del FIP están los torneos de tu país: el torneo de club (todas las semanas, en tu ciudad), el open regional y el circuito nacional. Se pueden ganar desde el primer año, dan pocos puntos y, cuando tu ranking ya está por encima, dejan de aceptarte. Cada torneo de la semana te dice cómo te queda: **fácil, a tu nivel, exigente o muy difícil**; los que no son para ti quedan plegados. Los títulos de tu país se cuentan aparte de los FIP.
- **Una temporada de verdad, semana a semana.** 52 semanas con cada torneo en su fecha: FIP Promises, Rise, Star, Gold y Platinum, Premier Padel P2 y P1, los cuatro Majors y las Finals en la última semana del año. Cada semana juegas uno como mucho, el que te deje tu ranking, o descansas o entrenas. El juego te marca el que **te conviene** (el que más te puede subir el ranking, contando que sólo valen tus 10 mejores resultados) y, si quieres, lo elige él todas las semanas. Jugar cansa: la energía manda en cuántos torneos aguantas al año.
- **Partidos simulados con momentos clave.** Los momentos clave se juegan en la pista o en minijuegos, y las finales siempre en la pista. El % que se muestra es la probabilidad real.
- **El circuito de verdad.** Las 20 mejores parejas son jugadores reales del Premier Padel: el ranking FIP del 21/09/2026 y las parejas del París Major. Al cerrarse cada trimestre esas parejas juegan su propio calendario, con un solo campeón por torneo, y suben o bajan según lo que ganan. Los torneos que juegas tú respetan tu resultado: si ganas, el campeón eres tú y la pareja de la final la pierde; si caes, quien te ganó pasa de ronda. Lo que pasó sale en las **noticias del circuito**, el ranking te muestra **quién tienes alrededor** y cuánto te falta para pasarlo, y si estás en el top 12 te puede llamar **una estrella** para jugar con vos (y su pareja se queda sola).
- **Dos temas:** "Día de pista" (claro, por defecto) y el oscuro de siempre. Se cambia con el botón de arriba a la derecha o desde Cómo se juega, y queda guardado.
- **Mundial de selecciones** cada dos años, **desafío del día**, **entrenamiento**, **mercado de parejas**, **El Ídolo** (el modo difícil) y carreras guardadas.

## Carpetas

| Carpeta | Qué hay |
|---|---|
| `juego/` | El juego, tal y como está publicado. Es un solo `index.html`. |
| `fuentes/` | De dónde sale el juego: la base, los módulos, las pasadas de parches y las pruebas. |
| `versiones/` | Las versiones anteriores: `v1`, `v2`, `v3`, `arcade`, `carrera` y `circuito`. |
| `publicadas/` | Copias de lo que estuvo publicado en cada momento, por si hay que volver atrás. |
| `servidor.js` | Un servidor local para jugar en el ordenador. |

## Jugar en tu ordenador

Hace falta [Node.js](https://nodejs.org).

```sh
node servidor.js
```

Después abre http://localhost:8793. Para abrir una versión anterior, pásale la carpeta:

```sh
node servidor.js versiones/v2
```

## Cómo está hecho

`juego/index.html` no se edita a mano: se **monta** desde `fuentes/`.

- `v1.html` es la base.
- Los archivos `c-*.js` y `c-*.css` son los módulos: motor de la pista, carrera, vistas, circuito real, circuito vivo, temas, Mundial, El Ídolo, etc.
- Los `patch*.py` son las pasadas que se aplican en orden sobre la base.

Para montarlo:

```sh
sh fuentes/construir.sh
```

### Pruebas

Se ejecutan sin navegador, desde `fuentes/` y después de montar el juego (que deja `nuevo.html` ahí):

```sh
cd fuentes
node prueba.js nuevo.html 12      # carreras enteras jugadas por bots
node reales.js nuevo.html         # el circuito real
node circuito.js nuevo.html 12    # el circuito que juega solo
node paises.js nuevo.html         # que el país no dé ventaja
node noticias.js nuevo.html       # que las noticias digan quién ganó de verdad
node calib-base.js nuevo.html     # cuánto cuesta cada categoría según el año de carrera
```

`medir.js` mide la dificultad (número 1, primer título, % de partidos ganados y mejor puesto) con semillas fijas, para comparar ajustes sin ruido.
