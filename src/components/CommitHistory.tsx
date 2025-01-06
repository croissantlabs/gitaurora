import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Path, db } from "@/db/dexie";
import { type Branch, type Commit, useGitCommand } from "@/hooks/useGitCommand";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDownToLine, FilePenLine, GitCommit } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router";
import { Button } from "./ui/button";

interface CommitHistoryProps {
	path: Path;
	branchName: string;
}

function CommitHistory({ path, branchName }: CommitHistoryProps) {
	const { getAllCommitsFromBranch, getAllGitBranches } = useGitCommand();
	const [commits, setCommits] = useState<Commit[]>();
	const [isCurrentBranchActive, setIsCurrentBranchActive] = useState<Branch>();

	const fetchBranches = async () => {
		const allBranches = await getAllGitBranches(path.path);
		const isCurrentBranchActive = allBranches.find(
			(branch) => branch.name === branchName && branch.is_active,
		);
		setIsCurrentBranchActive(isCurrentBranchActive);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchCommits = async () => {
			const commits = await getAllCommitsFromBranch(path.path, branchName);
			setCommits(commits);
		};
		fetchCommits();
		fetchBranches();
	}, [branchName]);

	return (
		<ResizablePanelGroup direction="horizontal" className="h-full w-full">
			<ResizablePanel>
				<ScrollArea className="p-4 border-r border-border flex h-full">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold">Commit History</h2>
						<Button size="sm" variant="outline">
							<ArrowDownToLine size={18} />
						</Button>
					</div>
					<ul>
						{isCurrentBranchActive && (
							<NavLink
								to={"current_change"}
								className={({ isActive }) =>
									`flex items-center p-2 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : ""}`
								}
							>
								{/* {commit.isMerge ? (
									<GitMerge className="mr-2" size={18} />
								) : (
									<GitCommit className="mr-2" size={18} />
								)} */}
								<FilePenLine className="mr-2" size={18} />
								Current Change
							</NavLink>
						)}

						{commits?.map((commit) => (
							<NavLink
								to={`commit/${commit.id}`}
								key={commit.id}
								className={({ isActive }) =>
									`flex items-center p-2 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : ""}`
								}
							>
								{/* {commit.isMerge ? (
									<GitMerge className="mr-2" size={18} />
								) : (
									<GitCommit className="mr-2" size={18} />
								)} */}
								<GitCommit className="mr-2" size={18} />
								<div>
									<div className="font-semibold">{commit.message}</div>
									<div className="text-sm text-muted-foreground">
										{commit.author} - {commit.date}
									</div>
								</div>
							</NavLink>
						))}
					</ul>
				</ScrollArea>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel className="w-3/4">
				<Outlet />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}

export const CommitHistoryContainer = () => {
	const { pathId, branchId } = useParams();

	const path = useLiveQuery(
		() => db.paths.where({ uuid: pathId }).first(),
		[branchId, pathId],
	);

	if (!path || !branchId) {
		return <div>Loading...</div>;
	}

	return <CommitHistory path={path} branchName={branchId} />;
};
