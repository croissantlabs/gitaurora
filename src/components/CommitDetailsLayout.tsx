import type { Path } from "@/db/dexie";
import type { Commit } from "@/hooks/useGitCommand";
import { invoke } from "@tauri-apps/api/core";

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

export const CommitDetailsLayout = () => {
	const path = useOutletContext<Path>();
	const [commitDetails, setCommitDetails] = useState<Commit | null>(null);
	const { commitId } = useParams();

	const fetchCommits = async () => {
		if (commitId && path?.path) {
			const commit = await getChangeFromCommit(path.path, commitId);

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
					{commitDetails && <CommitDetailsInterface commit={commitDetails} />}
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<Outlet context={commitDetails?.changes} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};
