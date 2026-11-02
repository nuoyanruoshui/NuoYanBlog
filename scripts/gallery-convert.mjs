// 把相册 raw/ 目录下的原图转成 webp（最长边 1600），文件名沿用原文件名
// 用法： node scripts/gallery-convert.mjs <相册目录>
import sharp from "sharp";
import { readdirSync, unlinkSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
	console.error("用法：node scripts/gallery-convert.mjs public/images/albums/Scenery");
	process.exit(1);
}

const rawDir = path.join(dir, "raw");
if (!existsSync(rawDir)) {
	console.log("没有 raw/ 目录，跳过");
	process.exit(0);
}

const files = readdirSync(rawDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
let count = 0;

for (const f of files) {
	const src = path.join(rawDir, f);
	const out = path.join(dir, f.replace(/\.(jpe?g|png)$/i, ".webp"));
	try {
		// 先读进内存再交给 sharp：libvips 直接映射文件时，Windows 下随后的 unlink 会 EPERM
		const buf = readFileSync(src);
		await sharp(buf).resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
		unlinkSync(src);
		count++;
		console.log("✓", path.basename(out));
	} catch (e) {
		console.log("✗", f, e.message);
	}
}

console.log(`转换完成：${count} 张`);
