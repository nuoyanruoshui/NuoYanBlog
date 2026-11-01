// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other" | "Unity" | "Godot";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
}

export const projectsData: Project[] = [
	{
		id: "Unity Excel Importer",
		title: "Unity Excel Importer",
		description: "一个用于Unity的表格资源读取工具",
		image: "",
		category: "Unity",
		techStack: ["Unity", "Excel"],
		status: "in-progress",
		liveDemo: "https://gitee.com/NuoYanRuoShui/ExcelImporter",
		sourceCode: "https://gitee.com/NuoYanRuoShui/ExcelImporter",
		startDate: "2024-08-01",
		endDate: "2025-10-01",
		tags: ["Blog", "Unity", "Excel"],
	},
	{
		id: "GF Unity Excel Importer",
		title: "GF Unity Excel Importer",
		description: "将读取表格的工具适配GF框架",
		image: "",
		category: "Unity",
		techStack: ["Unity", "Excel"],
		status: "planned",
		liveDemo: "https://gitee.com/NuoYanRuoShui/ExcelImporter",
		sourceCode: "https://gitee.com/NuoYanRuoShui/ExcelImporter",
		startDate: "2024-08-01",
		endDate: "2025-10-01",
		tags: ["Blog", "Unity", "Excel"],
	},
	{
		id: "Unity UI Manager",
		title: "Unity UI Manager",
		description: "一个简单好用的UI管理框架",
		image: "",
		category: "Unity",
		techStack: ["Unity", "UI"],
		status: "completed",
		liveDemo:
			"https://www.bilibili.com/video/BV11bRrYiE3V?vd_source=cbcb01112bcf2b5e16c5a97933138e45&spm_id_from=333.788.videopod.sections",
		sourceCode: "https://gitee.com/NuoYanRuoShui/simple-uimanager.git",
		startDate: "2025-05-01",
		endDate: "2025-09-01",
		tags: ["Blog", "Unity", "UI"],
	},
	{
		id: "Layout",
		title: "Unity GameObject LayoutGroup",
		description:
			"由于Unity自身的LayoutGroup只适用于UI，且只能是矩形布局，所以实现的自定义的布局管理器，实现了Unity自带组件的功能的同时，且适配了SpriteRenderer",
		image: "",
		category: "Unity",
		techStack: ["Unity", "Layout"],
		status: "completed",
		liveDemo:
			"https://www.bilibili.com/video/BV11bRrYiE3V?vd_source=cbcb01112bcf2b5e16c5a97933138e45&spm_id_from=333.788.videopod.sections",
		sourceCode: "https://gitee.com/NuoYanRuoShui/simple-uimanager.git",
		startDate: "2025-05-01",
		endDate: "2025-09-01",
		featured: true,
		tags: ["Blog", "Unity", "UI"],
	},
	{
		id: "RecyclerView",
		title: "Unity RecyclerView",
		description: "一个简单好用的Unity无限滚动列表",
		image: "",
		category: "Unity",
		techStack: ["Unity", "RecyclerView"],
		status: "completed",
		liveDemo:
			"https://www.bilibili.com/video/BV11bRrYiE3V?vd_source=cbcb01112bcf2b5e16c5a97933138e45&spm_id_from=333.788.videopod.sections",
		sourceCode: "https://gitee.com/NuoYanRuoShui/simple-uimanager.git",
		startDate: "2025-05-01",
		endDate: "2025-07-01",
		tags: ["Blog", "Unity", "UI"],
	},
	{
		id: "easy-save",
		title: "Unity EasySave",
		description: "一个简单好用的Unity存储系统",
		image: "",
		category: "Unity",
		techStack: ["Unity", "RecyclerView"],
		status: "completed",
		startDate: "2025-03-01",
		tags: ["Blog", "Unity", "Data"],
	},
	{
		id: "grid-bag",
		title: "Unity Grid Bag",
		description: "Unity网格背包",
		image: "",
		category: "Unity",
		techStack: ["Unity", "Bag"],
		status: "completed",
		startDate: "2025-08-04",
		tags: ["Blog", "Unity", "Bag"],
	},

	// ===== 以下按 GitHub 仓库补充（nuoyanruoshui）=====
	{
		id: "godot-game-framework",
		title: "GodotGameFramework",
		description:
			"基于 GameFramework 的 Godot 框架：重构资源加载模块，用 Luban 替代 GF 自带的读表工具，并对各个组件做了针对 Godot 的适配。",
		image: "",
		category: "Godot",
		techStack: ["Godot", "C#", "Luban"],
		status: "in-progress",
		sourceCode: "https://github.com/nuoyanruoshui/GodotGameFramework",
		startDate: "2026-06-14",
		endDate: "2026-10-21",
		featured: true,
		tags: ["GitHub", "Godot", "框架"],
	},
	{
		id: "unity-behaviour-tree",
		title: "UnityBehaviourTree",
		description:
			"基于 Unity 的可视化行为树框架，提供所见即所得的节点编辑器。可以像搭积木一样拼出 AI 行为，再到运行时驱动它。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#", "Editor"],
		status: "completed",
		sourceCode: "https://github.com/nuoyanruoshui/UnityBehaviourTree",
		startDate: "2026-08-04",
		featured: true,
		tags: ["GitHub", "Unity", "AI"],
	},
	{
		id: "unity-gameobject-pool",
		title: "UnityGameObjectPool",
		description:
			"高性能对象池系统：支持同步/异步加载、自动回收、过期清理、运行时统计与 Editor 可视化调试，适配 YooAsset、Addressables、Resources 等资源管线。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#"],
		status: "completed",
		sourceCode: "https://github.com/nuoyanruoshui/UnityGameObjectPool",
		startDate: "2026-06-12",
		endDate: "2026-06-23",
		featured: true,
		tags: ["GitHub", "Unity", "性能"],
	},
	{
		id: "unity-extension",
		title: "UnityExtension",
		description:
			"通用扩展库：单例、Optional/Maybe 单子、责任链、每日定时事件、对象池、数学与时间工具，以及覆盖 Transform / GameObject / Input / UI 的扩展方法集合。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#"],
		status: "completed",
		sourceCode: "https://github.com/nuoyanruoshui/UnityExtension",
		startDate: "2026-06-23",
		tags: ["GitHub", "Unity", "工具库"],
	},
	{
		id: "unity-script-binder",
		title: "UnityScriptBinder",
		description:
			"Unity 脚本绑定工具：自动生成绑定代码，简化组件与脚本之间的绑定过程，省掉手写字段查找和赋值的重复劳动。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#", "Editor"],
		status: "in-progress",
		sourceCode: "https://github.com/nuoyanruoshui/UnityScriptBinder",
		startDate: "2026-09-04",
		endDate: "2026-10-19",
		tags: ["GitHub", "Unity", "编辑器"],
	},
	{
		id: "unity-interactive",
		title: "UnityInteractive",
		description:
			"基于 Unity 的交互系统框架，提供统一的事件处理与交互案例管理机制，避免交互逻辑散落在各个 MonoBehaviour 里。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#"],
		status: "in-progress",
		sourceCode: "https://github.com/nuoyanruoshui/UnityInteractive",
		startDate: "2026-06-12",
		endDate: "2026-10-10",
		tags: ["GitHub", "Unity", "玩法"],
	},
	{
		id: "dialogue-system-so",
		title: "DialogueSystem_SO",
		description:
			"一个基于 ScriptableObject 的对话系统，把对白数据做成资源，编辑和复用都不必改代码。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#", "ScriptableObject"],
		status: "completed",
		sourceCode: "https://github.com/nuoyanruoshui/DialogueSystem_SO",
		startDate: "2026-06-03",
		endDate: "2026-07-31",
		tags: ["GitHub", "Unity", "剧情"],
	},
	{
		id: "timeline-system",
		title: "TimelineSystem",
		description:
			"基于 Unity 原生 Timeline 的技能系统，用时间轴编排技能表现与逻辑，方便策划直接调时序。",
		image: "",
		category: "Unity",
		techStack: ["Unity", "C#", "Timeline"],
		status: "completed",
		sourceCode: "https://github.com/nuoyanruoshui/TimelineSystem",
		startDate: "2026-07-06",
		endDate: "2026-07-07",
		tags: ["GitHub", "Unity", "战斗"],
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => techSet.add(tech));
	});
	return Array.from(techSet).sort();
};
