export async function withStepTiming<T>(
	step: string,
	logLatency: (event: string, data?: Record<string, unknown>) => void,
	fn: () => Promise<T>,
	extra?: (result: T) => Record<string, unknown> | undefined,
): Promise<T> {
	const startMs = Date.now();
	const result = await fn();
	logLatency(step, {
		durationMs: Date.now() - startMs,
		...(extra ? extra(result) : {}),
	});
	return result;
}
