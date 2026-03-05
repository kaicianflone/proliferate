import crypto from "node:crypto";

export interface IdleControllerState {
	activeHttpToolCalls: number;
	idleCheckTimer: ReturnType<typeof setInterval> | null;
	lastActivityAt: number;
	lastKnownAgentIdleAt: number | null;
	proxyConnections: Set<string>;
}

export interface IdleControllerDeps {
	checkIntervalMs: number;
	getClientType: () => string | null;
	getSessionKind: () => string | null;
	getClientCount: () => number;
	getHasRunningTools: () => boolean;
	getCurrentAssistantMessageId: () => string | null;
	isRuntimeReady: () => boolean;
	hasSandbox: () => boolean;
	getIdleGraceMs: () => number;
	logInfo: (message: string) => void;
	logError: (message: string, error?: unknown) => void;
	runIdleSnapshot: () => Promise<void>;
}

export function touchActivity(state: IdleControllerState): void {
	state.lastActivityAt = Date.now();
}

export function trackToolCallStart(state: IdleControllerState): void {
	state.activeHttpToolCalls++;
	touchActivity(state);
}

export function trackToolCallEnd(state: IdleControllerState): void {
	state.activeHttpToolCalls = Math.max(0, state.activeHttpToolCalls - 1);
	touchActivity(state);
}

export function addProxyConnection(state: IdleControllerState): () => void {
	const connectionId = crypto.randomUUID();
	state.proxyConnections.add(connectionId);
	touchActivity(state);
	let removed = false;
	return () => {
		if (removed) return;
		removed = true;
		state.proxyConnections.delete(connectionId);
		touchActivity(state);
	};
}

export function shouldIdleSnapshot(state: IdleControllerState, deps: IdleControllerDeps): boolean {
	const clientType = deps.getClientType();
	if (clientType === "automation") return false;
	if (deps.getSessionKind() === "manager") return false;
	if (state.activeHttpToolCalls > 0) return false;
	if (deps.getHasRunningTools()) return false;
	if (deps.getClientCount() > 0) return false;
	if (state.proxyConnections.size > 0) return false;
	const assistantMessageOpen = deps.getCurrentAssistantMessageId() !== null;
	if (assistantMessageOpen && state.lastKnownAgentIdleAt === null) return false;
	const runtimeReady = deps.isRuntimeReady();
	if (!runtimeReady && state.lastKnownAgentIdleAt === null) return false;
	if (!deps.hasSandbox()) return false;
	return Date.now() - state.lastActivityAt >= deps.getIdleGraceMs();
}

export function startIdleMonitor(state: IdleControllerState, deps: IdleControllerDeps): void {
	if (state.idleCheckTimer) {
		return;
	}
	state.idleCheckTimer = setInterval(() => {
		checkIdleSnapshot(state, deps);
	}, deps.checkIntervalMs);
}

export function stopIdleMonitor(state: IdleControllerState): void {
	if (state.idleCheckTimer) {
		clearInterval(state.idleCheckTimer);
		state.idleCheckTimer = null;
	}
}

export function markAgentIdle(state: IdleControllerState): void {
	touchActivity(state);
	state.lastKnownAgentIdleAt = Date.now();
}

export function clearAgentIdle(state: IdleControllerState): void {
	state.lastKnownAgentIdleAt = null;
}

function checkIdleSnapshot(state: IdleControllerState, deps: IdleControllerDeps): void {
	if (!shouldIdleSnapshot(state, deps)) {
		return;
	}
	deps.logInfo("Idle snapshot conditions met, running idle snapshot");
	deps
		.runIdleSnapshot()
		.then(() => {
			deps.logInfo("Idle snapshot complete");
			state.lastKnownAgentIdleAt = null;
		})
		.catch((err) => {
			deps.logError("Idle snapshot failed", err);
		});
}
