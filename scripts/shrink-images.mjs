// 把各目录里的 webp 压到指定宽度（只缩不放）
// 注意：先读进内存再处理，否则 libvips 映射着文件时写回同一个路径会 EPERM/UNKNOWN
import sharp from "sharp";
import { readdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";

const jobs = [
	["src/assets/anime", 320, 78],
	["public/images/covers", 1000, 80],
	["public/images/albums/Scenery", 1000, 80],
];

for (const [dir, width, quality] of jobs) {
	const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".webp"));
	let n = 0;
	let before = 0;
	let after = 0;
	for (const f of files) {
		const p = path.join(dir, f);
		const raw = readFileSync(p);
		before += raw.length;
		const meta = await sharp(raw).metadata();
		if ((meta.width ?? 0) <= width) {
			after += raw.length;
			continue;
		}
		const buf = await sharp(raw).resize({ width }).webp({ quality }).toBuffer();
		writeFileSync(p, buf);
		after += buf.length;
		n++;
	}
	console.log(`${dir}: ${files.length} 张，缩放 ${n} 张，${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
}
