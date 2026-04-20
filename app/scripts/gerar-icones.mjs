#!/usr/bin/env node
/**
 * Gera os ícones PWA a partir de um SVG inline com o orbe ✦ da identidade
 * Luz Branca (paleta Rainha da Floresta — verde sobre papel).
 *
 * Requer ImageMagick (`magick`) disponível no PATH. Saída em
 * `static/icons/`:
 *   - icon-192.png       (192x192, purpose "any")
 *   - icon-512.png       (512x512, purpose "any")
 *   - icon-maskable.png  (512x512 com safe zone ~80%, purpose "maskable")
 *
 * Rodar: `pnpm gerar-icones`
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'static', 'icons');
mkdirSync(outDir, { recursive: true });

const PAPEL = '#fafaf8';
const VERDE = '#5a7a3e';
const LINHA = '#e8e8e3';

/**
 * SVG "any" — orbe ocupa ~55% do canvas (seguro fora do maskable safe zone).
 */
function svgAny(size) {
  const center = size / 2;
  const raio = size * 0.34;
  const stroke = Math.max(1, Math.round(size / 192));
  const fontSize = Math.round(size * 0.42);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAPEL}"/>
  <circle cx="${center}" cy="${center}" r="${raio}" fill="none" stroke="${LINHA}" stroke-width="${stroke}"/>
  <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
    font-family="Fraunces, 'Times New Roman', serif" font-weight="300"
    font-size="${fontSize}" fill="${VERDE}">✦</text>
</svg>`;
}

/**
 * SVG "maskable" — orbe menor (~40%), ocupa só o safe zone central de 80%
 * para sobreviver às máscaras circulares/arredondadas do Android.
 */
function svgMaskable(size) {
  const center = size / 2;
  const raio = size * 0.24;
  const stroke = Math.max(1, Math.round(size / 256));
  const fontSize = Math.round(size * 0.28);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAPEL}"/>
  <circle cx="${center}" cy="${center}" r="${raio}" fill="none" stroke="${LINHA}" stroke-width="${stroke}"/>
  <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
    font-family="Fraunces, 'Times New Roman', serif" font-weight="300"
    font-size="${fontSize}" fill="${VERDE}">✦</text>
</svg>`;
}

function converter(svg, outFile, size) {
  const svgPath = resolve(outDir, `${outFile}.svg`);
  const pngPath = resolve(outDir, `${outFile}.png`);
  writeFileSync(svgPath, svg);
  execSync(
    `magick -background "${PAPEL}" -density 300 "${svgPath}" -resize ${size}x${size} "${pngPath}"`,
    { stdio: 'inherit' }
  );
  // SVG intermediário é mantido para inspeção / regeneração.
  console.log(`  ✓ ${pngPath}`);
}

console.log('Gerando ícones PWA…');
converter(svgAny(192), 'icon-192', 192);
converter(svgAny(512), 'icon-512', 512);
converter(svgMaskable(512), 'icon-maskable', 512);
console.log('Pronto.');
