# ⚽ Mundial 2026 · Juego de Predicciones

**🌐 Idioma: [English](README.md) | Español**

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Demo en vivo](https://img.shields.io/badge/▶_Jugar_ahora-GitHub_Pages-blue)](https://johncardonac.github.io/worldcup-2026-predictions/)

Predice todos los partidos del **Mundial FIFA 2026** (Canadá · México · EE. UU.), desde la fase de grupos hasta el campeón, compara tus predicciones con los resultados reales y mide tu porcentaje de acierto.

Un solo archivo HTML. Sin instalación, sin cuenta, sin servidor. Tus datos nunca salen de tu navegador.

**▶ Juega ahora: <https://johncardonac.github.io/worldcup-2026-predictions/>**

---

## ✨ Funcionalidades

- **Los 104 partidos reales** — sorteo, calendario y sedes oficiales (grupos A–L, 11 jun – 19 jul 2026).
- **Predicciones de fase de grupos** — escribe tu marcador para los 72 partidos; las tablas de posiciones se calculan en vivo con los criterios oficiales FIFA (puntos → diferencia de gol → goles a favor).
- **Bracket completo de eliminatorias** — tu bracket se arma automáticamente con tus predicciones de grupos: primeros, segundos y los 8 mejores terceros, usando la **tabla oficial del Anexo C de FIFA (las 495 combinaciones de terceros)**. Predice marcadores (o solo haz clic en el ganador) hasta la final. Si predices empate, elige con un clic al ganador de los penales.
- **⟳ Actualizar resultados reales** — un botón trae los marcadores reales (fuentes, en orden: fixturedownload.com → API de FIFA → TheSportsDB). También puedes escribirlos a mano.
- **Aciertos y puntos** — marcadores exactos, resultados (1X2), equipos acertados por ronda eliminatoria y puntaje total.
- **Partidos de hoy** — tarjetas grandes con la hora **en tu zona horaria**, sede, tu predicción y el resultado en vivo.
- **Guardado en la nube y ranking global (☁️)** — opcional: escribe tu correo (sin contraseña, sin registro) y tus predicciones se sincronizan entre dispositivos. Un ranking en vivo compara tus puntos con todos los que juegan.
- **Bilingüe** — cambia entre español e inglés cuando quieras (botón 🌐).
- **Modo claro y oscuro** — sigue tu sistema, o cámbialo con el botón ☀️/🌙.
- **Respaldo** — exporta / importa todas tus predicciones como archivo JSON.

## 🚀 Cómo usarla

**Opción 1 — Jugar en línea (lo más fácil):**
Abre <https://johncardonac.github.io/worldcup-2026-predictions/> en cualquier navegador moderno. Listo.

**Opción 2 — Descargar:**
1. Descarga [`index.html`](https://raw.githubusercontent.com/JohnCardonaC/worldcup-2026-predictions/main/index.html) (clic derecho → Guardar como).
2. Doble clic al archivo. Se abre en tu navegador y funciona sin internet (solo el botón de actualizar necesita conexión).

**Opción 3 — Clonar:**
```bash
git clone https://github.com/JohnCardonaC/worldcup-2026-predictions.git
cd worldcup-2026-predictions
open index.html   # macOS — o simplemente doble clic
```

## 🎮 Cómo se juega

1. **Pestaña Fase de grupos** — escribe tu marcador (campos azules) en los 72 partidos. Las tablas se actualizan mientras escribes.
2. **Pestaña Eliminatorias → "Mi bracket"** — con tus 72 predicciones completas aparece tu bracket. Escribe marcadores o haz clic en equipos para avanzarlos, ronda por ronda, hasta coronar a tu campeón.
3. Durante el torneo, presiona **⟳ Actualizar resultados reales**. Los marcadores reales llenan los campos verdes, el bracket real se arma solo y **Mis aciertos** muestra cómo vas.

## 🏆 Puntaje

| Acierto | Puntos |
|---|---|
| Marcador exacto (grupos y eliminatorias) | 3 |
| Resultado correcto (1X2) | 1 |
| Equipo correcto en 16vos | 1 c/u |
| Equipo correcto en octavos | 2 c/u |
| Equipo correcto en cuartos | 3 c/u |
| Equipo correcto en semifinales | 5 c/u |
| Finalista correcto | 8 c/u |
| Campeón correcto | 13 |

## ☁️ Guardado en la nube y ranking

Haz clic en el **botón ☁️**, escribe tu correo y un nombre. Sin contraseña ni verificación — tus predicciones se guardan solas y apareces en el ranking de jugadores (pestaña "Mis aciertos"). Conecta el mismo correo en otro dispositivo para continuar ahí.

Cómo funciona: tu correo **nunca se almacena** — la app calcula una huella (hash) localmente y la usa como tu identificador. El backend es un servicio mínimo en AWS Lambda + DynamoDB (mira [`aws/deploy.sh`](aws/deploy.sh) si quieres montar el tuyo: corre el script y pega la URL que imprime en `CLOUD_URL` dentro de `index.html`).

Nota honesta: no hay autenticación. Cualquiera que sepa qué correo usaste podría cargar o sobreescribir tu guardado. Es un juego entre amigos — no guardes nada sensible.

## 🔒 Privacidad

Todo se guarda en el `localStorage` de tu navegador. La función opcional de nube almacena solo una huella de tu correo, tu nombre visible y tus predicciones. Sin rastreo ni cuentas. Usa **Exportar** para respaldar tus predicciones e **Importar** para restaurarlas.

## ⚠️ Limitaciones

- Los criterios de desempate 4–6 de FIFA (fair play y ranking FIFA) no se pueden calcular solo con marcadores; en ese caso raro la app usa la posición del sorteo. Las tablas podrían diferir de las oficiales solo en empates extremos.
- Las fuentes gratuitas de datos pueden ir unas horas detrás del resultado en vivo — siempre puedes escribir el resultado a mano (campos verdes).
- Penales: si un partido real de eliminatorias termina empatado y la fuente no reporta la tanda, haz clic en el ganador dentro del bracket real.

## 🛠 Tecnología

Un único archivo HTML autocontenido: JavaScript puro, sin frameworks, sin compilación, sin dependencias. Los datos del torneo (sorteo, calendario, sedes, estructura del bracket y las 495 combinaciones de terceros del reglamento FIFA) van embebidos.

## 📄 Licencia

[MIT](LICENSE) — úsalo como quieras, sin garantías.

Fuentes de datos: calendario y reglamento oficial FIFA (vía Wikipedia), fixturedownload.com, TheSportsDB.
