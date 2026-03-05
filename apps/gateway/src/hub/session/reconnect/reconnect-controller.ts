export interface ReconnectControllerState {
	reconnectAttempt: number;
	reconnectTimerId: ReturnType<typeof setTimeout> | null;
	reconnectGeneration: number;
}

export interface ReconnectControllerDeps {
	reconnectDelaysMs: number[];
	logger: {
		info: (obj: unknown, msg?: string) => void;
		error: (obj: unknown, msg?: string) => void;
	};
	getClientCount: () => number;
	ensureRuntimeReady: (options?: { reason?: "auto_reconnect" }) => Promise<void>;
}

export function cancelReconnect(state: ReconnectControllerState): void {
	state.reconnectGeneration++;
	if (state.reconnectTimerId) {
		clearTimeout(state.reconnectTimerId);
		state.reconnectTimerId = null;
	}
	state.reconnectAttempt = 0;
}

export function scheduleReconnect(
	state: ReconnectControllerState,
	deps: ReconnectControllerDeps,
): void {
	const delays = deps.reconnectDelaysMs;
	const delayIndex = Math.min(state.reconnectAttempt, delays.length - 1);
	const delay = delays[delayIndex];
	state.reconnectAttempt++;

	const generation = state.reconnectGeneration;
	deps.logger.info(
		{ attempt: state.reconnectAttempt, delayMs: delay, generation },
		"Scheduling reconnection",
	);

	state.reconnectTimerId = setTimeout(() => {
		state.reconnectTimerId = null;
		if (state.reconnectGeneration !== generation) {
			deps.logger.info(
				{ expected: generation, current: state.reconnectGeneration },
				"Reconnection aborted: generation mismatch",
			);
			return;
		}

		if (deps.getClientCount() === 0) {
			deps.logger.info({}, "No clients connected, aborting reconnection");
			state.reconnectAttempt = 0;
			return;
		}

		deps
			.ensureRuntimeReady({ reason: "auto_reconnect" })
			.then(() => {
				deps.logger.info({}, "Reconnection successful");
				state.reconnectAttempt = 0;
			})
			.catch((err) => {
				deps.logger.error({ err }, "Reconnection failed, retrying...");
				scheduleReconnect(state, deps);
			});
	}, delay);
}
