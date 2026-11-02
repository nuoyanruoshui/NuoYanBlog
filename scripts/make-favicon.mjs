// 生成大肥鱼 favicon（light / dark 两套，尺寸 32/128/180/192）
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const S = 512;

const whale = (bg, ring, body1, body2) => `
<svg width="${S}" height="${S}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${body1}"/>
      <stop offset="100%" stop-color="${body2}"/>
    </linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#dbe7ff"/>
    </linearGradient>
    <clipPath id="round"><rect x="0" y="0" width="${S}" height="${S}" rx="112"/></clipPath>
  </defs>

  <g clip-path="url(#round)">
    <rect width="${S}" height="${S}" fill="${bg}"/>
    <circle cx="256" cy="268" r="196" fill="${ring}" opacity="0.35"/>

    <!-- 尾巴 -->
    <path d="M382 268 C414 240 452 228 476 232 C458 254 454 278 462 300 C440 296 410 292 384 302 Z"
          fill="url(#body)"/>

    <!-- 身体 -->
    <ellipse cx="248" cy="292" rx="176" ry="150" fill="url(#body)"/>
    <!-- 肚皮 -->
    <ellipse cx="248" cy="344" rx="126" ry="82" fill="url(#belly)"/>

    <!-- 眼睛 -->
    <ellipse cx="186" cy="252" rx="34" ry="38" fill="#ffffff"/>
    <ellipse cx="306" cy="252" rx="34" ry="38" fill="#ffffff"/>
    <circle cx="190" cy="256" r="19" fill="#1B2340"/>
    <circle cx="302" cy="256" r="19" fill="#1B2340"/>
    <circle cx="198" cy="247" r="7" fill="#ffffff"/>
    <circle cx="310" cy="247" r="7" fill="#ffffff"/>

    <!-- 腮红 -->
    <ellipse cx="132" cy="312" rx="26" ry="16" fill="#FF9EC4" opacity="0.65"/>
    <ellipse cx="364" cy="312" rx="26" ry="16" fill="#FF9EC4" opacity="0.65"/>

    <!-- 笑 -->
    <path d="M222 312 Q248 336 274 312" stroke="#1B2340" stroke-width="11" fill="none" stroke-linecap="round"/>

    <!-- 蝴蝶结 -->
    <g transform="translate(248 130)">
      <path d="M-6 0 C-48 -32 -82 -14 -74 20 C-68 48 -34 46 -6 18 Z" fill="#FF7FB0"/>
      <path d="M6 0 C48 -32 82 -14 74 20 C68 48 34 46 6 18 Z" fill="#FF7FB0"/>
      <circle cx="0" cy="12" r="15" fill="#FF4F93"/>
    </g>
  </g>
</svg>`;

const variants = {
	light: whale("#FFF1F8", "#FFC9E2", "#7FA9FF", "#4D6BFE"),
	dark: whale("#1D1330", "#FF9ECB", "#8FB3FF", "#4D6BFE"),
};

const sizes = [32, 128, 180, 192];

for (const [name, svg] of Object.entries(variants)) {
	for (const size of sizes) {
		const out = `public/favicon/favicon-${name}-${size}.png`;
		await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
	}
	// 顺手留一份 512 的，做社交分享图 / 应用图标用
	await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(`public/favicon/favicon-${name}-512.png`);
	const meta = await sharp(`public/favicon/favicon-${name}-32.png`).metadata();
	console.log(name, "ok", `${meta.width}x${meta.height}`);
}
