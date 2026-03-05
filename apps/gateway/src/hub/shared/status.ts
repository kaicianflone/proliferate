export type HubStatus =
	| "creating"
	| "resuming"
	| "running"
	| "paused"
	| "stopped"
	| "error"
	| "migrating";

export type HubStatusOrNull = HubStatus | null;

export type HubStatusCallback = (status: HubStatus, message?: string) => void;
