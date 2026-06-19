// Construye la carpeta www/ que Capacitor empaqueta en el APK.
// Copia los archivos de la app (los mismos que se publican en GitHub Pages),
// omitiendo el service worker (innecesario en la app nativa, evita caché obsoleta).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

const items = ['index.html', 'manifest.webmanifest', 'vendor', 'icons', 'assets'];
for (const it of items) {
  const src = path.join(root, it);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(www, it), { recursive: true });
  }
}

console.log('www/ construido con:', items.filter(i => fs.existsSync(path.join(www, i))).join(', '));
