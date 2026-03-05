export async function waitForOpenCodeReady(input: {
	openCodeUrl: string;
	log: (message: string, data?: Record<string, unknown>) => void;
	logError: (message: string, error?: unknown) => void;
	loggerWarn: (data: Record<string, unknown>, message: string) => void;
}): Promise<void> {
	const maxAttempts = 8;
	const intervalMs = 1500;
	const perAttemptTimeoutMs = 2000;
	const probeUrl = `${input.openCodeUrl}/session`;

	input.log("Waiting for OpenCode readiness", { probeUrl });
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const attemptStartMs = Date.now();
		try {
			const response = await fetch(probeUrl, {
				signal: AbortSignal.timeout(perAttemptTimeoutMs),
			});
			input.log("OpenCode ready", {
				attempt,
				status: response.status,
				durationMs: Date.now() - attemptStartMs,
			});
			return;
		} catch (err) {
			const durationMs = Date.now() - attemptStartMs;
			const message = err instanceof Error ? err.message : String(err);
			const cause =
				err instanceof Error && err.cause && typeof err.cause === "object"
					? (err.cause as { code?: string; message?: string })
					: undefined;

			input.loggerWarn(
				{
					attempt,
					maxAttempts,
					durationMs,
					probeUrl,
					error: message,
					causeCode: cause?.code,
					causeMessage: cause?.message,
				},
				"OpenCode readiness probe failed",
			);

			if (attempt >= maxAttempts) {
				input.logError("OpenCode did not become ready", err);
				throw new Error(`OpenCode not reachable after ${maxAttempts} attempts (${message})`);
			}
			await new Promise((resolve) => setTimeout(resolve, intervalMs));
		}
	}
}
