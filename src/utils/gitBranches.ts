import type { GitCommit } from "@/types/git";

export function getLatestCommitsByBranch(commits: GitCommit[]): Set<string> {
	const latestCommits = new Set<string>();
	const processedBranches = new Set<string>();

	// Iterate through commits (already sorted by timestamp)
	for (const commit of commits) {
		if (!processedBranches.has(commit.branch)) {
			latestCommits.add(commit.id);
			processedBranches.add(commit.branch);
		}
	}

	return latestCommits;
}
