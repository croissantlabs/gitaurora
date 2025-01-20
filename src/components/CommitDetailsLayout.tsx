import type { Path } from "@/db/dexie";
import type { Commit } from "@/hooks/useGitCommand";
import { invoke } from "@tauri-apps/api/core";

import type { FileChange } from "@/types/git";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { CommitDetailsInterface } from "./CommitDetailsInterface";
import { CardContent } from "./ui/card";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

const getChangeFromCommit = async (
	directory: string,
	commitId: string,
): Promise<Commit> => {
	try {
		const change: Commit = await invoke("get_commit_changes", {
			currentPath: directory,
			commitId,
		});

		return change;
	} catch (error) {
		console.error("Error getting change from commit:", error);
		throw error;
	}
};

const getChangedFilesInCommit = async (
	directory: string,
	commitId: string,
): Promise<FileChange[]> => {
	try {
		const change: FileChange[] = await invoke("get_changed_files_in_commit", {
			directory,
			commitHash: commitId,
		});

		return change;
	} catch (error) {
		console.error("Error getting change from commit:", error);
		throw error;
	}
};

export const CommitDetailsLayout = () => {
	const path = useOutletContext<Path>();
	const [commitDetails, setCommitDetails] = useState<Commit | null>(null);
	const [files, setFiles] = useState<FileChange[]>([]);
	const { commitId } = useParams();

	const fetchCommits = async () => {
		if (commitId && path?.path) {
			const commit = await getChangeFromCommit(path.path, commitId);
			const changes = await getChangedFilesInCommit(path.path, commitId);

			console.log(changes);
			setFiles(changes);
			setCommitDetails(commit);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchCommits();
	}, [commitId]);

	if (!commitDetails) {
		return null;
	}

	return (
		<div className="h-full flex flex-col">
			<CardContent className="border-b border-border p-4">
				<h3 className="font-semibold">{commitDetails.message}</h3>
				<p className="text-sm text-muted-foreground">
					{commitDetails.author} - {commitDetails.date} - {commitDetails.id}
				</p>
			</CardContent>
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel
					defaultSize={25}
					className="border-r border-border h-full"
				>
					<CommitDetailsInterface files={files} />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<Outlet context={{ path, files }} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};
