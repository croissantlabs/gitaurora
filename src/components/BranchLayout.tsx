import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { type Path, db } from "@/db/dexie";
import { type Branch, useGitCommand } from "@/hooks/useGitCommand";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, GitBranch, GitCommit, GitPullRequest } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface BranchLayoutProps {
	path: Path;
}

export function BranchLayout({ path }: BranchLayoutProps) {
	const navigate = useNavigate();
	const [branches, setBranches] = useState<Branch[]>();
	const [isCurrentlyCreatingBranch, setIsCurrentlyCreatingBranch] =
		useState(false);
	const [newBranchName, setNewBranchName] = useState("");
	const { getAllGitBranches, createBranch, switchBranch } = useGitCommand();

	const fetchBranches = async () => {
		const allBranches = await getAllGitBranches(path.path);
		setBranches(allBranches);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchBranches();
	}, [path]);

	const createNewBranch = async (branchName: string) => {
		try {
			await createBranch(path.path, branchName);
			await fetchBranches();
			setIsCurrentlyCreatingBranch(false);
			setNewBranchName("");
			navigate(`/dashboard/path/${path.uuid}/branch/${branchName}`);
		} catch (error) {
			console.error(error);
		}
	};

	const checkoutBranch = async (branchName: string) => {
		try {
			await switchBranch(path.path, branchName);
			await fetchBranches();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col flex-1 bg-background">
			<ResizablePanelGroup
				direction="horizontal"
				className="flex-1 h-full w-full"
			>
				<ResizablePanel
					defaultSize={25}
					className="flex flex-col h-full w-1/4 overflow-hidden"
				>
					<ScrollArea className="flex h-full p-4 border-r border-border">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold">Branches</h2>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setIsCurrentlyCreatingBranch(!isCurrentlyCreatingBranch)
								}
							>
								<GitBranch className="h-4 w-4" />
							</Button>
						</div>
						{isCurrentlyCreatingBranch && (
							<div className="flex items-center justify-between mb-4">
								<Input
									type="text"
									value={newBranchName}
									onChange={(e) => setNewBranchName(e.target.value)}
									className="w-full p-2 mr-2 border border-border rounded-md"
									placeholder="Enter branch name"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => createNewBranch(newBranchName)}
								>
									<Check className="h-4 w-4" />
								</Button>
							</div>
						)}
						{branches?.map((branch) => (
							<NavLink
								key={branch.name}
								to={`branch/${branch.name}`}
								className={({ isActive }) =>
									`flex items-center p-2 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : ""}`
								}
								onDoubleClick={() => checkoutBranch(branch.name)}
							>
								<GitBranch className="mr-2" size={18} />
								{branch.name}
								{branch.is_active && (
									<span className="ml-2 text-green-500">●</span>
								)}
							</NavLink>
						))}
					</ScrollArea>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={75}>
					<Outlet />
				</ResizablePanel>
			</ResizablePanelGroup>
			<footer className="flex items-center justify-between p-4 bg-card border-t border-border">
				<div className="flex items-center space-x-4">
					<ModeToggle />
					<Button variant="outline" size="sm">
						<GitPullRequest className="mr-2 h-4 w-4" />
						Create Pull Request
					</Button>
					<Button variant="outline" size="sm">
						<GitCommit className="mr-2 h-4 w-4" />
						Commit Changes
					</Button>
				</div>
				<div className="flex items-center space-x-4">
					<span>Current Branch: main</span>
					<span>Last Fetch: 5 minutes ago</span>
				</div>
			</footer>
		</div>
	);
}

export const BranchLayoutContainer = () => {
	const { pathId } = useParams();
	const path = useLiveQuery(
		() => db.paths.where({ uuid: pathId }).first(),
		[pathId],
	);

	if (!path) {
		return <div>Loading...</div>;
	}

	return <BranchLayout path={path} />;
};
