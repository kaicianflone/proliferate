import type { Message, ServerMessage } from "@proliferate/shared";
import { buildControlPlaneSnapshot, buildInitConfig } from "../control-plane";
import type { SessionRecord } from "../runtime/session-context-store";

export interface InitWorkflowDeps {
	sessionId: string;
	getRuntimeSession: () => SessionRecord;
	getFreshControlPlaneSession: (base: SessionRecord) => Promise<SessionRecord>;
	getOpenCodeUrl: () => string | null;
	getOpenCodeSessionId: () => string | null;
	getPreviewUrl: () => string | null;
	isCompletedAutomationSession: () => boolean;
	collectOutputs: () => Promise<Message[]>;
	buildCompletedAutomationFallbackMessages: () => Message[];
	log: (message: string, data?: Record<string, unknown>) => void;
	logError: (message: string, error?: unknown) => void;
	reconnectGeneration: number;
	mapHubStatusToControlPlaneRuntime: () =>
		| import("@proliferate/shared/contracts/sessions").SessionRuntimeStatus
		| null;
}

export async function buildInitMessages(
	deps: InitWorkflowDeps,
): Promise<{ initPayload: ServerMessage; snapshotPayload: ServerMessage }> {
	const contextSession = deps.getRuntimeSession();
	const snapshotSession = await deps.getFreshControlPlaneSession(contextSession);
	const openCodeUrl = deps.getOpenCodeUrl() ?? contextSession.open_code_tunnel_url ?? null;
	const openCodeSessionId =
		deps.getOpenCodeSessionId() ?? contextSession.coding_agent_session_id ?? null;
	const previewUrl = deps.getPreviewUrl() ?? contextSession.preview_tunnel_url ?? null;
	const isCompletedAutomationSession = deps.isCompletedAutomationSession();

	let transformed: Message[] = [];
	if (openCodeUrl && openCodeSessionId) {
		try {
			deps.log("Fetching harness outputs for init...", { openCodeSessionId });
			transformed = await deps.collectOutputs();
			deps.log("Fetched harness outputs", { messageCount: transformed.length });
		} catch (err) {
			if (!isCompletedAutomationSession) {
				throw err;
			}
			deps.logError(
				"Harness output fetch failed for completed automation; using fallback transcript",
				err,
			);
		}
	} else if (!isCompletedAutomationSession) {
		throw new Error("Missing agent session info");
	}

	if (transformed.length === 0 && isCompletedAutomationSession) {
		transformed = deps.buildCompletedAutomationFallbackMessages();
		deps.log("Using completed automation fallback transcript", {
			messageCount: transformed.length,
			hasInitialPrompt: Boolean(contextSession.initial_prompt),
			hasSummary: Boolean(contextSession.summary),
			outcome: contextSession.outcome ?? null,
		});
	}

	deps.log("Sending init to client", {
		messageCount: transformed.length,
		isCompletedAutomationSession,
	});

	return {
		initPayload: {
			type: "init",
			payload: {
				messages: transformed,
				config: buildInitConfig(previewUrl),
			},
		},
		snapshotPayload: {
			type: "control_plane_snapshot",
			payload: buildControlPlaneSnapshot(
				snapshotSession,
				deps.reconnectGeneration,
				deps.mapHubStatusToControlPlaneRuntime(),
			),
		},
	};
}
