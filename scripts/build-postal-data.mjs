import { inflateRawSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
const url = "https://www.post.japanpost.jp/service/search/zipcode/download/utf/zip/utf_ken_all.zip";
const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error("Postal dataset download failed");
const zip = Buffer.from(await response.arrayBuffer());
let end = zip.length - 22;
while (end >= Math.max(0, zip.length - 65557) && zip.readUInt32LE(end) !== 0x06054b50) end--;
if (end < 0 || zip.readUInt32LE(end) !== 0x06054b50) throw new Error("Invalid postal archive");
let offset = zip.readUInt32LE(end + 16), csv;
for (let i = 0; i < zip.readUInt16LE(end + 10); i++) {
  if (zip.readUInt32LE(offset) !== 0x02014b50) throw new Error("Invalid archive entry");
  const length = zip.readUInt16LE(offset + 28);
  const name = zip.toString("utf8", offset + 46, offset + 46 + length);
  if (/utf_ken_all\.csv$/i.test(name)) {
    const local = zip.readUInt32LE(offset + 42);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const bytes = zip.subarray(start, start + zip.readUInt32LE(offset + 20));
    const method = zip.readUInt16LE(offset + 10);
    if (method !== 0 && method !== 8) throw new Error("Unsupported archive compression");
    csv = (method === 8 ? inflateRawSync(bytes) : bytes).toString("utf8");
    break;
  }
  offset += 46 + length + zip.readUInt16LE(offset + 30) + zip.readUInt16LE(offset + 32);
}
if (!csv) throw new Error("Postal CSV missing");
const addresses = {};
for (const line of csv.trim().split(/\r?\n/)) {
  const fields = []; let field = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { if (quoted && line[i+1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (line[i] === "," && !quoted) { fields.push(field); field = ""; } else field += line[i];
  }
  fields.push(field);
  if (!/^[0-9]{7}$/.test(fields[2]) || fields.length < 15) throw new Error("Invalid postal CSV row");
  const town = fields[8].includes("以下に掲載がない場合") ? "" : fields[8];
  const row = [fields[6], fields[7], town];
  const rows = addresses[fields[2]] ||= [];
  if (!rows.some(r => JSON.stringify(r) === JSON.stringify(row))) rows.push(row);
}
if (Object.keys(addresses).length < 100000) throw new Error("Postal dataset incomplete");
await mkdir("public", { recursive: true });
await writeFile("public/postal-addresses.json", JSON.stringify(addresses));
console.log("Public postal dataset prepared");
