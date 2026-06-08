# FAST-E.R. — Gestor de Fichas Clínicas

Herramienta **offline y multiplataforma** que ayuda al interno de medicina a redactar y
generar fichas clínicas (Ingreso, Evolución, Epicrisis) y descargarlas en formato **`.docx`**.

Funciona en **Android, Windows y Mac**, sin necesidad de conexión a internet.

---

## ✨ Características

- **100% offline**: todas las librerías (`docx`, `FileSaver`) están incluidas localmente. No
  se carga nada desde internet.
- **Instalable como app (PWA)**: se puede instalar en el dispositivo con su propio ícono.
- **Genera documentos `.docx`** listos para editar/imprimir.
- **Formulario clínico completo**: antecedentes, hábitos, diagnósticos, historia (plantilla o
  libre), laboratorio, imágenes, indicaciones, planes por sistema, fármacos y firmas.
- **Calculadora de FiO₂** estimada según dispositivo y flujo de O₂.

---

## 🚀 Cómo usarla

### Opción A — Instalarla como aplicación (recomendado)

Una vez publicada (por ejemplo en GitHub Pages), ábrela en el navegador y:

- **Android (Chrome):** menú ⋮ → *Agregar a pantalla de inicio* / *Instalar app*.
- **Windows / Mac (Chrome o Edge):** ícono de instalar ⊕ en la barra de direcciones.

Tras instalarla, **funciona sin internet** las siguientes veces.

### Opción B — Abrir el archivo directamente

Descarga el repositorio completo y abre `index.html` con doble clic. Mantén la carpeta
completa (con `vendor/` e `icons/`), ya que la app usa esos archivos locales.

> Nota: con `file://` (doble clic) el *Service Worker* no se activa, pero la app igual
> funciona offline porque las librerías son locales. Para la instalación como PWA hay que
> servirla por HTTP (ver más abajo).

---

## 🛠️ Desarrollo

La app es un sitio estático. Para probar la PWA en local necesitas servirla por HTTP:

```bash
# Cualquiera de estas opciones, desde la carpeta del proyecto:
python3 -m http.server 8080
# o
npx serve .
```

Luego abre <http://localhost:8080>.

### Estructura del proyecto

```
index.html               App principal (formulario + generación de .docx)
manifest.webmanifest     Metadatos de la PWA (nombre, íconos, colores)
service-worker.js        Cache offline (precache de todos los recursos)
vendor/
  docx.umd.js            Librería docx (generación de Word) — local
  FileSaver.min.js       Descarga de archivos en el navegador — local
icons/                   Íconos de la app (192, 512, maskable, apple-touch)
scripts/
  make-icons.cjs         Genera los íconos PNG (cruz médica) sin dependencias
```

### Al publicar una versión nueva

Sube el número de versión en `service-worker.js` (`CACHE_VERSION`) para que los dispositivos
descarguen los cambios en lugar de servir la versión cacheada antigua.

---

## ⚠️ Aviso

Herramienta de apoyo a la documentación clínica. **No reemplaza el juicio médico.** El usuario
es responsable de revisar y validar todo el contenido generado antes de su uso clínico.

Iniciativa desarrollada por Alberto Maturana Steinbrügge.
