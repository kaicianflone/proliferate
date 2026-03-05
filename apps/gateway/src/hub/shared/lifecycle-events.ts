export const SESSION_LIFECYCLE_EVENT = {
	STARTED: "session_started",
	RESUMED: "session_resumed",
	PAUSED: "session_paused",
	COMPLETED: "session_completed",
	FAILED: "session_failed",
	CANCELLED: "session_cancelled",
	OUTCOME_PERSISTED: "session_outcome_persisted",
} as const;

export type SessionLifecycleEventType =
	(typeof SESSION_LIFECYCLE_EVENT)[keyof typeof SESSION_LIFECYCLE_EVENT];
