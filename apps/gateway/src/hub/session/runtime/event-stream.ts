import type { Logger } from "@proliferate/logger";
import type { OpenCodeCodingHarnessAdapter } from "../../../harness/coding/opencode/adapter";
import type { RuntimeDaemonEvent } from "../../../harness/contracts/coding";
import type { GatewayEnv } from "../../../lib/env";

export async function connectCodingEventStream(input: {
	codingHarness: OpenCodeCodingHarnessAdapter;
	openCodeUrl: string;
	env: GatewayEnv;
	logger: Logger;
	onDisconnect: (reason: string) => void;
	onEvent: (event: RuntimeDaemonEvent) => void;
	onLog: (message: string, data?: Record<string, unknown>) => void;
}): Promise<import("../../../harness/contracts/coding").CodingHarnessEventStreamHandle> {
	input.onLog("Connecting to coding harness event stream...", { url: input.openCodeUrl });
	const handle = await input.codingHarness.streamEvents({
		baseUrl: input.openCodeUrl,
		env: input.env,
		logger: input.logger,
		onDisconnect: (reason) => input.onDisconnect(reason),
		onEvent: (event) => {
			input.logger.debug(
				{ channel: event.channel, type: event.type },
				"runtime.daemon_event.normalized",
			);
			input.onEvent(event);
		},
	});
	input.onLog("Harness event stream connected");
	return handle;
}
