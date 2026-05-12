// Run: node scripts/compress-images.mjs
import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const PUBLIC_DIR = './public';
const MIN_SIZE_KB = 50;   // skip files already smaller than this
const JPG_QUALITY  = 75;
const PNG_QUALITY  = 80;

let totalBefore = 0;
let totalAfter  = 0;
let count       = 0;

async function compress(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { await compress(full); continue; }

    const ext = extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const beforeBytes = statSync(full).size;
    if (beforeBytes / 1024 < MIN_SIZE_KB) continue;

    try {
      // Read into buffer first — avoids Windows file-lock / path issues with sharp
      const input = readFileSync(full);
      let buf;
      if (ext === '.png') {
        buf = await sharp(input)
          .png({ compressionLevel: 9, quality: PNG_QUALITY, effort: 10 })
          .toBuffer();
      } else {
        buf = await sharp(input)
          .jpeg({ quality: JPG_QUALITY, progressive: true })
          .toBuffer();
      }

      if (buf.length < beforeBytes) {
        writeFileSync(full, buf);
        const saved = Math.round((beforeBytes - buf.length) / 1024);
        console.log(`✓ ${entry.name.padEnd(55)} ${Math.round(beforeBytes/1024)}KB → ${Math.round(buf.length/1024)}KB  (-${saved}KB)`);
        totalBefore += beforeBytes;
        totalAfter  += buf.length;
        count++;
      } else {
        console.log(`— ${entry.name.padEnd(55)} already optimal`);
      }
    } catch (e) {
      console.error(`✗ ${entry.name}: ${e.message}`);
    }
  }
}

await compress(PUBLIC_DIR);

console.log('\n─────────────────────────────────────────────');
console.log(`Files compressed : ${count}`);
console.log(`Before           : ${(totalBefore/1024/1024).toFixed(2)} MB`);
console.log(`After            : ${(totalAfter/1024/1024).toFixed(2)} MB`);
console.log(`Saved            : ${((totalBefore-totalAfter)/1024/1024).toFixed(2)} MB`);
