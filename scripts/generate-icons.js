// Run: node generate-icons.js
// Creates simple PNG icons without external dependencies.
import { createWriteStream, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function u32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n)
  return b
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = u32(data.length)
  const crc = crc32(Buffer.concat([t, data]))
  return Buffer.concat([len, t, data, u32(crc)])
}

// CRC32 table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function generatePNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])])

  // Image data: RGBA rows with filter byte 0
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = [0] // filter none
    for (let x = 0; x < size; x++) {
      // Rounded corners mask
      const rx = size * 0.22
      const inCorner = (
        (x < rx && y < rx && Math.hypot(x - rx, y - rx) > rx) ||
        (x > size - rx && y < rx && Math.hypot(x - (size - rx), y - rx) > rx) ||
        (x < rx && y > size - rx && Math.hypot(x - rx, y - (size - rx)) > rx) ||
        (x > size - rx && y > size - rx && Math.hypot(x - (size - rx), y - (size - rx)) > rx)
      )
      if (inCorner) {
        row.push(255, 255, 255) // transparent → white bg
      } else {
        // Blue background #3b82f6
        row.push(59, 130, 246)
      }
    }
    rows.push(...row)
  }

  const raw = Buffer.from(rows)
  const compressed = deflateSync(raw)
  const idat = chunk('IDAT', compressed)
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend])
}

mkdirSync('public/icons', { recursive: true })

for (const size of [192, 512]) {
  const png = generatePNG(size)
  writeFileSync(`public/icons/icon-${size}.png`, png)
  console.log(`✓ public/icons/icon-${size}.png`)
}
console.log('Done! Replace with proper icons before publishing.')
