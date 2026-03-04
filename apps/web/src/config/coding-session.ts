import {
	AlertTriangle,
	Code,
	FolderTree,
	GitBranch,
	Globe,
	KeyRound,
	Layers,
	Settings,
	SquareTerminal,
	Zap,
} from "lucide-react";

export const PANEL_TABS = [
	{ type: "url" as const, label: "Preview", icon: Globe },
	{ type: "files" as const, label: "Files", icon: FolderTree },
	{ type: "vscode" as const, label: "Code", icon: Code },
	{ type: "terminal" as const, label: "Terminal", icon: SquareTerminal },
	{ type: "git" as const, label: "Git", icon: GitBranch },
	{ type: "services" as const, label: "Services", icon: Layers },
	{ type: "artifacts" as const, label: "Workspace", icon: Zap },
	{ type: "environment" as const, label: "Env", icon: KeyRound },
	{ type: "settings" as const, label: "Settings", icon: Settings },
];

/** Manager sessions: simplified panel set (G9). */
export const MANAGER_PANEL_TABS = [
	{ type: "terminal" as const, label: "Terminal", icon: SquareTerminal },
	{ type: "settings" as const, label: "Settings", icon: Settings },
];

export const INVESTIGATION_TAB = {
	type: "investigation" as const,
	label: "Investigate",
	icon: AlertTriangle,
};
