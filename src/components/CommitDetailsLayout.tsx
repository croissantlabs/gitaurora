import { db } from "@/db/dexie";
import { type Commit, useGitCommand } from "@/hooks/useGitCommand";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { CommitDetailsInterface } from "./CommitDetailsInterface";
import { CardContent } from "./ui/card";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

export const CommitDetailsLayout = () => {
	const commits = useOutletContext<Commit[]>();
	const { getChangeFromCommit } = useGitCommand();
	const [commitDetails, setCommitDetails] = useState<Commit | null>(null);
	const { pathId, commitId } = useParams();

	const path = useLiveQuery(
		() => db.paths.where({ uuid: pathId }).first(),
		[commitId, pathId],
	);

	const commit = commits.find((c) => c.id === commitId);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (commitId && path?.path) {
			const fetchCommits = async () => {
				const commit = await getChangeFromCommit(path.path, commitId);

				setCommitDetails(commit);
			};
			fetchCommits();
		}
	}, [commitId, path?.path]);

	if (!commit) {
		return null;
	}

	return (
		<div className="h-full flex flex-col">
			<CardContent className="border-b border-border p-4">
				<h3 className="font-semibold">{commit.message}</h3>
				<p className="text-sm text-muted-foreground">
					{commit.author} - {commit.date} - {commit.id}
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
