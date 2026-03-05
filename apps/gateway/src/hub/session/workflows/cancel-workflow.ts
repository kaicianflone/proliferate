export interface CancelWorkflowDeps {
	ensureRuntimeReady: () => Promise<void>;
	onMigrationInProgress: () => void;
	getOpenCodeUrl: () => string | null;
	getOpenCodeSessionId: () => string | null;
	interruptCurrentRun: () => Promise<void>;
	getCurrentAssistantMessageId: () => string | null;
	clearCurrentAssistantMessageId: () => void;
	broadcastCancelled: (messageId?: string) => void;
	log: (message: string, data?: Record<string, unknown>) => void;
	logError: (message: string, error?: unknown) => void;
	isMigrationInProgressError: (error: unknown) => boolean;
}

export async function runCancelWorkflow(deps: CancelWorkflowDeps): Promise<void> {
	deps.log("Handling cancel request");
	try {
		await deps.ensureRuntimeReady();
	} catch (err) {
		if (deps.isMigrationInProgressError(err)) {
			deps.onMigrationInProgress();
			return;
		}
		throw err;
	}

	if (!deps.getOpenCodeUrl() || !deps.getOpenCodeSessionId()) {
		deps.log("No OpenCode session to cancel");
		return;
	}

	try {
		await deps.interruptCurrentRun();
		deps.log("OpenCode session aborted");
	} catch (err) {
		deps.logError("OpenCode abort failed", err);
	}

	const messageId = deps.getCurrentAssistantMessageId();
	deps.broadcastCancelled(messageId || undefined);
	deps.log("Message cancelled", { messageId });
	deps.clearCurrentAssistantMessageId();
}
