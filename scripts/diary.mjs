// 追加一条短记/日记
// 用法： node scripts/diary.mjs "今天的内容" ["/images/diary/a.jpg,/images/diary/b.jpg"]
import { readFileSync, writeFileSync } from "node:fs";

const [content, imagesArg] = process.argv.slice(2);
if (!content) {
	console.error('用法：node scripts/diary.mjs "内容" ["图片1,图片2"]');
	process.exit(1);
}

const FILE = "src/data/moments.ts";
const src = readFileSync(FILE, "utf-8");

// 找到当前最大 id
const ids = [...src.matchAll(/id:\s*(\d+)/g)].map((m) => Number(m[1]));
const nextId = (ids.length ? Math.max(...ids) : 0) + 1;

const images = (imagesArg ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

const iso = new Date().toISOString();
const entry = `	{
		id: ${nextId},
		content: ${JSON.stringify(content)},
		date: "${iso}",
		images: [${images.map((i) => JSON.stringify(i)).join(", ")}],
	},
`;

const idx = src.lastIndexOf("];");
if (idx === -1) {
	console.error("找不到 moments 数组结尾");
	process.exit(1);
}
writeFileSync(FILE, `${src.slice(0, idx)}${entry}${src.slice(idx)}`, "utf-8");
console.log(`已追加第 ${nextId} 条：${content.slice(0, 30)}…`);
