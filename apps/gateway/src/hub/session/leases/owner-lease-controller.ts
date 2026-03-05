import {
	OWNER_LEASE_TTL_MS,
	acquireOwnerLease,
	clearRuntimeLease,
	releaseOwnerLease,
	renewOwnerLease,
	setRuntimeLease,
} from "../../../lib/session-leases";

export interface OwnerLeaseControllerState {
	leaseRenewTimer: ReturnType<typeof setInterval> | null;
	lastLeaseRenewAt: number;
	ownsOwnerLease: boolean;
}

export interface OwnerLeaseControllerDeps {
	sessionId: string;
	instanceId: string;
	renewIntervalMs: number;
	logger: {
		error: (obj: unknown, msg?: string) => void;
	};
	onSelfTerminate: () => void;
}

export async function startOwnerLeaseRenewal(
	state: OwnerLeaseControllerState,
	deps: OwnerLeaseControllerDeps,
): Promise<void> {
	if (state.leaseRenewTimer) {
		return;
	}

	const acquired = await acquireOwnerLease(deps.sessionId, deps.instanceId);
	if (!acquired) {
		deps.logger.error({}, "Failed to acquire owner lease — another instance owns this session");
		throw new Error("Session is owned by another instance");
	}
	state.ownsOwnerLease = true;
	state.lastLeaseRenewAt = Date.now();

	state.leaseRenewTimer = setInterval(() => {
		const now = Date.now();
		if (now - state.lastLeaseRenewAt > OWNER_LEASE_TTL_MS) {
			deps.logger.error(
				{
					lastRenewAt: state.lastLeaseRenewAt,
					lag: now - state.lastLeaseRenewAt,
					ttl: OWNER_LEASE_TTL_MS,
				},
				"Split-brain detected: event loop lag exceeds lease TTL, self-terminating hub",
			);
			deps.onSelfTerminate();
			return;
		}

		state.lastLeaseRenewAt = now;
		renewOwnerLease(deps.sessionId, deps.instanceId)
			.then((renewed) => {
				if (!renewed) {
					state.ownsOwnerLease = false;
					deps.logger.error({}, "Owner lease lost during renewal, self-terminating");
					deps.onSelfTerminate();
				}
			})
			.catch((err) => {
				deps.logger.error({ err }, "Failed to renew owner lease");
			});

		setRuntimeLease(deps.sessionId).catch((err) => {
			deps.logger.error({ err }, "Failed to renew runtime lease");
		});
	}, deps.renewIntervalMs);
}

export function stopOwnerLeaseRenewal(
	state: OwnerLeaseControllerState,
	deps: Pick<OwnerLeaseControllerDeps, "sessionId" | "instanceId" | "logger">,
): void {
	if (state.leaseRenewTimer) {
		clearInterval(state.leaseRenewTimer);
		state.leaseRenewTimer = null;
	}
	if (!state.ownsOwnerLease) {
		return;
	}
	state.ownsOwnerLease = false;

	releaseOwnerLease(deps.sessionId, deps.instanceId).catch((err) => {
		deps.logger.error({ err }, "Failed to release owner lease");
	});
	clearRuntimeLease(deps.sessionId).catch((err) => {
		deps.logger.error({ err }, "Failed to clear runtime lease");
	});
}
