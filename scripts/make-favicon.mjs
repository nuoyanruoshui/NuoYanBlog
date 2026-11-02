// 用站点头像生成 favicon（light / dark 同一张，尺寸 32/128/180/192 + 512）
import sharp from "sharp";
import { readFileSync } from "node:fs";

const SRC = "src/assets/images/waguri.webp";
const raw = readFileSync(SRC);

const sizes = [32, 128, 180, 192, 512];

// 先裁成正方形（头像本身是竖图，取中间偏上，保住脸）
const square = await sharp(raw).resize(512, 512, { fit: "cover", position: "centre" }).png().toBuffer();

for (const size of sizes) {
	const buf = await sharp(square).resize(size, size).png().toBuffer();
	for (const variant of ["light", "dark"]) {
		await sharp(buf).toFile(`public/favicon/favicon-${variant}-${size}.png`);
	}
}

const meta = await sharp(`public/favicon/favicon-light-192.png`).metadata();
console.log("done", `${meta.width}x${meta.height}`);
