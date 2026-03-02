/**
 * Harness contract interfaces.
 *
 * Pure interfaces shared between gateway and other packages.
 * Types that depend on gateway-specific imports (GatewayEnv, Logger, Message)
 * remain in apps/gateway/src/harness/.
 */

// ---------------------------------------------------------------------------
// Runtime daemon events
// ---------------------------------------------------------------------------

export interface RuntimeDaemonEvent {
	source: "daemon";
	channel: "server" | "session" | "message";
	type: string;
	isTerminal: boolean;
	occurredAt: string;
	payload: unknown;
}

// ---------------------------------------------------------------------------
// Coding harness input/result types (gateway-independent)
// ---------------------------------------------------------------------------

export interface CodingHarnessPromptImage {
	data: string;
	mediaType: string;
}

export interface CodingHarnessStartInput {
	baseUrl: string;
	title?: string;
}

export interface CodingHarnessStartResult {
	sessionId: string;
}

export interface CodingHarnessResumeInput {
	baseUrl: string;
	sessionId?: string | null;
	title?: string;
}

export interface CodingHarnessResumeResult {
	sessionId: string;
	mode: "reused" | "adopted" | "created";
}

export interface CodingHarnessInterruptInput {
	baseUrl: string;
	sessionId: string;
}

export interface CodingHarnessShutdownInput {
	baseUrl: string;
	sessionId: string;
}

export interface CodingHarnessSendPromptInput {
	baseUrl: string;
	sessionId: string;
	content: string;
	images?: CodingHarnessPromptImage[];
}

export interface CodingHarnessCollectOutputsInput {
	baseUrl: string;
	sessionId: string;
}

// ---------------------------------------------------------------------------
// Daemon stream envelope (shared between daemon and gateway)
// ---------------------------------------------------------------------------

export type DaemonStreamType =
	| "pty_out"
	| "fs_change"
	| "agent_event"
	| "port_opened"
	| "port_closed"
	| "sys_event";

export interface DaemonStreamEnvelope {
	v: "1";
	stream: DaemonStreamType;
	seq: number;
	event: "data" | "close" | "error";
	payload: unknown;
	ts: number;
}

// ---------------------------------------------------------------------------
// Workspace state types (used by workspace panels)
// ---------------------------------------------------------------------------

export type WorkspaceSessionState =
	| "running"
	| "paused"
	| "waiting_for_approval"
	| "completed"
	| "failed";

export interface WorkspaceStateInfo {
	state: WorkspaceSessionState;
	/** If paused, reason. */
	pauseReason?: string | null;
	/** If completed or failed, the outcome. */
	outcome?: string | null;
	/** If failed, canonical error code. */
	errorCode?: string | null;
	/** Whether sandbox is still reachable. */
	sandboxAvailable: boolean;
}

export type ServiceStatus = "starting" | "running" | "degraded" | "stopped";

export interface ServiceEntry {
	name: string;
	status: ServiceStatus;
	port?: number | null;
	command?: string;
}

export interface PreviewPort {
	port: number;
	host?: string;
}

export interface FsTreeEntry {
	name: string;
	path: string;
	type: "file" | "directory" | "symlink";
	size?: number;
}

// ---------------------------------------------------------------------------
// Manager harness
// ---------------------------------------------------------------------------

export interface ManagerHarnessStartInput {
	managerSessionId: string;
	organizationId: string;
	workerId: string | null;
	gatewayUrl: string;
	serviceToken: string;
	anthropicApiKey: string;
	llmProxyUrl?: string;
}

export interface ManagerHarnessState {
	managerSessionId: string;
	status: "running" | "interrupted" | "stopped" | "idle";
	currentRunId?: string;
}

export interface ManagerHarnessAdapter {
	readonly name: string;
	start(input: ManagerHarnessStartInput): Promise<ManagerHarnessState>;
	resume(input: ManagerHarnessStartInput): Promise<ManagerHarnessState>;
	interrupt(): Promise<ManagerHarnessState>;
	shutdown(): Promise<ManagerHarnessState>;
}
