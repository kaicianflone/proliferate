import type { Logger } from "@proliferate/logger";
import { configurations, sessions } from "@proliferate/services";
import type { SandboxProviderType, SnapshotResultMessage } from "@proliferate/shared";
import { getSandboxProvider } from "@proliferate/shared/providers";
import { prepareForSnapshot } from "../migration/snapshot-scrub";
import type { SessionContext } from "../runtime/session-context-store";

export async function runSaveSnapshotWorkflow(input: {
	sessionId: string;
	context: SessionContext;
	message?: string;
	logger: Logger;
	broadcast: (message: SnapshotResultMessage) => void;
	log: (message: string, data?: Record<string, unknown>) => void;
}): Promise<{ snapshotId: string; target: "configuration" | "session" }> {
	const { context } = input;
	if (!context.session.sandbox_id) {
		throw new Error("No sandbox to snapshot");
	}

	const isSetupSession = context.session.session_type === "setup";
	const target = isSetupSession ? "configuration" : "session";
	const startTime = Date.now();
	input.log("Saving snapshot", { target, message: input.message });

	const providerType = context.session.sandbox_provider as SandboxProviderType;
	const provider = getSandboxProvider(providerType);
	const sandboxId = context.session.sandbox_id;

	const finalizeSnapshotPrep = await prepareForSnapshot({
		provider,
		sandboxId,
		configurationId: context.session.configuration_id,
		logger: input.logger,
		logContext: "manual_snapshot",
		failureMode: "throw",
		reapplyAfterCapture: true,
	});

	let result: { snapshotId: string };
	try {
		result = await provider.snapshot(input.sessionId, sandboxId);
	} finally {
		await finalizeSnapshotPrep();
	}

	if (isSetupSession) {
		if (!context.session.configuration_id) {
			throw new Error("Setup session has no configuration");
		}
		await configurations.update(context.session.configuration_id, {
			snapshotId: result.snapshotId,
			status: "ready",
		});
	} else {
		await sessions.updateSession(input.sessionId, {
			snapshotId: result.snapshotId,
		});
	}

	const providerMs = Date.now() - startTime;
	const totalMs = Date.now() - startTime;
	input.log(
		`[Timing] +${totalMs}ms snapshot complete (provider: ${providerMs}ms, db: ${totalMs - providerMs}ms)`,
	);

	input.broadcast({
		type: "snapshot_result",
		payload: { success: true, snapshotId: result.snapshotId, target },
	});

	return { snapshotId: result.snapshotId, target };
}
