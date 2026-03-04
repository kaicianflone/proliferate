import { z } from "zod";
export const REPO_BASELINE_STATUSES = ["validating", "ready", "stale", "failed"] as const;
export type RepoBaselineStatus = (typeof REPO_BASELINE_STATUSES)[number];

const REPO_BASELINE_TRANSITIONS: Record<string, readonly RepoBaselineStatus[]> = {
	validating: ["ready", "failed"],
	ready: ["stale", "validating"],
	stale: ["validating"],
	failed: ["validating"],
};

export function isValidRepoBaselineTransition(
	from: RepoBaselineStatus,
	to: RepoBaselineStatus,
): boolean {
	return REPO_BASELINE_TRANSITIONS[from]?.includes(to) ?? false;
}

export const RepoBaselineStatusSchema = z.enum(REPO_BASELINE_STATUSES);

export const RepoBaselineSchema = z.object({
	id: z.string(),
	repoId: z.string(),
	organizationId: z.string(),
	status: RepoBaselineStatusSchema,
	version: z.string().nullable(),
	snapshotId: z.string().nullable(),
	sandboxProvider: z.string().nullable(),
	setupSessionId: z.string().nullable(),
	installCommands: z.any().nullable(),
	runCommands: z.any().nullable(),
	testCommands: z.any().nullable(),
	serviceCommands: z.any().nullable(),
	errorMessage: z.string().nullable(),
	createdBy: z.string().nullable(),
	createdAt: z.string().nullable(),
	updatedAt: z.string().nullable(),
});

export type RepoBaseline = z.infer<typeof RepoBaselineSchema>;

export const RepoBaselineTargetSchema = z.object({
	id: z.string(),
	repoBaselineId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	configJson: z.any().nullable(),
	createdAt: z.string().nullable(),
});

export type RepoBaselineTarget = z.infer<typeof RepoBaselineTargetSchema>;
