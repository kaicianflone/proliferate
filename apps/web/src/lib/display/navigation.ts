import { PAGE_TITLES } from "@/config/navigation";

export function getPageTitle(pathname: string): string {
	if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
	for (const [path, title] of Object.entries(PAGE_TITLES)) {
		if (pathname.startsWith(`${path}/`)) return title;
	}
	return "";
}
