import type { Path } from "@/db/dexie";
import type { Branch, Commit } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { CommitHistoryInterface } from "./CommitHistoryInterface";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

const getAllCommitsFromBranch = async (
	directory: string,
	branchName: string,
): Promise<Commit[]> => {
	try {
		const commits: Commit[] = await invoke("get_all_commits_from_branch", {
			directory,
			branch: branchName,
		});

		return commits;
	} catch (error) {
		console.error("Error getting Git commits:", error);
		throw error;
	}
};

interface CommitHistoryLayoutContext {
	path: Path;
	branches: Branch[];
}

export const CommitHistoryLayout = () => {
	const context = useOutletContext<CommitHistoryLayoutContext>();
	const { path, branches } = context;
	const { branchId } = useParams();
	const [isLoadingCommits, setIsLoadingCommits] = useState(true);
	const currentBranch = branches.find((branch) => branch.name === branchId);
	const [commits, setCommits] = useState<Commit[]>([]);

	const fetchCommits = async () => {
		if (branchId) {
			setIsLoadingCommits(true);
			const commits = await getAllCommitsFromBranch(path.path, branchId);

			setCommits(commits);
			setIsLoadingCommits(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchCommits();
	}, [branchId]);

	return (
		<ResizablePanelGroup direction="horizontal" className="flex-1 h-auto">
			<ResizablePanel
				className=" border-r border-border h-full flex flex-col"
				defaultSize={20}
			>
				{currentBranch && (
					<CommitHistoryInterface
						commits={commits}
						branch={currentBranch}
						isLoadingCommits={isLoadingCommits}
					/>
				)}
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				<Outlet context={{ path, fetchCommits }} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
