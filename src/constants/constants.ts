export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark",
	AUTO_MODE = "auto";
export const DEFAULT_THEME = AUTO_MODE;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 90;

// Category constants
export const UNCATEGORIZED = "uncategorized";

// 主题色在 localStorage 里的键名。
// 换皮肤时把版本号 +1：老访客（包括作者自己）就能一次性看到新默认色，而不是被浏览器记住的旧色相盖住。
export const HUE_STORAGE_KEY = "hue-v2";
