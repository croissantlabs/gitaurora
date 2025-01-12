import type { Path } from "@/db/dexie";
import { type Commit, useGitCommand } from "@/hooks/useGitCommand";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { CommitHistoryInterface } from "./CommitHistoryInterface";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

export const CommitHistoryLayout = () => {
	const path = useOutletContext<Path>();
	const { branchId } = useParams();
	const [commits, setCommits] = useState<Commit[]>([]);
	const { getAllCommitsFromBranch } = useGitCommand();

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
				<Outlet context={commits} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
