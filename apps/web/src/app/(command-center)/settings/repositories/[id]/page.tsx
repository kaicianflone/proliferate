"use client";

import { BaselineSection } from "@/components/settings/repositories/baseline-section";
import { DangerSection } from "@/components/settings/repositories/danger-section";
import { EnvironmentSection } from "@/components/settings/repositories/environment-section";
import { ServiceCommandsSection } from "@/components/settings/repositories/service-commands-section";
import { SetupRunSection } from "@/components/settings/repositories/setup-run-section";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { useRepo } from "@/hooks/org/use-repos";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function RepoDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const repoId = params.id;

	const { data: repo, isLoading } = useRepo(repoId);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<LoadingDots size="md" className="text-muted-foreground" />
			</div>
		);
	}

	if (!repo) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-8">
				<p className="text-sm text-muted-foreground">Repository not found.</p>
				<Button
					variant="ghost"
					size="sm"
					className="mt-2"
					onClick={() => router.push("/settings/repositories")}
				>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back to repositories
				</Button>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
				{/* Header */}
				<div>
					<Button
						variant="ghost"
						onClick={() => router.push("/settings/repositories")}
						className="flex items-center gap-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
					>
						<ArrowLeft className="h-3 w-3" />
						Repositories
					</Button>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-lg font-semibold">{repo.githubRepoName}</h1>
							<div className="flex items-center gap-3 mt-1">
								<span className="text-xs text-muted-foreground">
									{repo.defaultBranch || "main"}
								</span>
								<a
									href={repo.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
								>
									<ExternalLink className="h-3 w-3" />
									GitHub
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Baseline */}
				<BaselineSection repoId={repoId} />

				{/* Environment */}
				<EnvironmentSection repoId={repoId} />

				{/* Service Commands */}
				<ServiceCommandsSection repoId={repoId} />

				{/* Latest Setup Session */}
				<SetupRunSection repoId={repoId} />

				{/* Danger Zone */}
				<DangerSection repoId={repoId} repoName={repo.githubRepoName} />
			</div>
		</div>
	);
}
