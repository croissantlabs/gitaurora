import type { Path } from "@/db/dexie";
import type { Commit } from "@/types/git";
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

export const CommitHistoryLayout = () => {
	const path = useOutletContext<Path>();
	const { branchId } = useParams();
	const [commits, setCommits] = useState<Commit[]>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (branchId) {
			const fetchCommits = async () => {
				const commits = await getAllCommitsFromBranch(path.path, branchId);

				setCommits(commits);
			};
			fetchCommits();
		}
	}, [branchId]);

	if (!branchId) {
		return null;
	}

	return (
		<ResizablePanelGroup direction="horizontal" className="flex-1 h-auto">
			<ResizablePanel
				className=" border-r border-border h-full flex flex-col"
				defaultSize={20}
			>
				<CommitHistoryInterface commits={commits} />
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				<Outlet context={path} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
