import type { Path } from "@/db/dexie";
import type { Branch, Commit, FileChange } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { CommitHistoryInterface } from "./CommitHistoryInterface";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";
import { CurrentChangeInterface } from "./CurrentChangeInterface";

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

const getCurrentChangeFile = async (
	directory: string,
): Promise<FileChange[]> => {
	try {
		const change: FileChange[] = await invoke("get_all_changed_files", {
			directory,
		});

		return change;
	} catch (error) {
		console.error("Error getting current change:", error);
		throw error;
	}
};

function compareTwoArrays(arr1: FileChange[], arr2: FileChange[]) {
	return JSON.stringify(arr1) === JSON.stringify(arr2);
}

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

	const [changes, setChanges] = useState<FileChange[]>([]);

	const fetchChanges = async () => {
		const uncommittedChanges = await getCurrentChangeFile(path.path);
		if (!compareTwoArrays(uncommittedChanges, changes)) {
			setChanges(uncommittedChanges);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (path.path) {
			fetchChanges();
			const intervalId = setInterval(fetchChanges, 2000);

			return () => clearInterval(intervalId);
		}
	}, []);

	return (
		<ResizablePanelGroup direction="horizontal" className="flex-1 h-auto">
			<ResizablePanel
				className=" border-r border-border h-full flex flex-col"
				defaultSize={20}
			>
				<ResizablePanelGroup direction="vertical">
					{currentBranch?.is_head && (
						<ResizablePanel>
							<CurrentChangeInterface
								changes={changes} fetchChanges={fetchChanges} fetchCommits={fetchCommits} path={path} />
						</ResizablePanel>
					)}
					<ResizableHandle />
					<ResizablePanel>
						{currentBranch && (
							<CommitHistoryInterface
								commits={commits}
								branch={currentBranch}
								isLoadingCommits={isLoadingCommits}
							/>
						)}
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				{changes && <Outlet context={{ path, fetchCommits, changes }} />}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
