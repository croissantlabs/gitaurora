import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Path } from "@/db/dexie";
import { useGitCommand } from "@/hooks/useGitCommand";
import type { Branch } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { Check, GitBranch, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

interface Props {
	path: Path;
	branches: Branch[];
	fetchBranches: () => void;
}

const mergeWithCurrentBranch = async (
	directory: string,
	branchName: string,
) => {
	try {
		await invoke("merge_with_current_branch", {
			directory,
			branchName,
		});
	} catch (error) {
		console.error("Error committing changes:", error);
		throw error;
	}
};

export const BranchInterface = ({ path, branches, fetchBranches }: Props) => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isCurrentlyCreatingBranch, setIsCurrentlyCreatingBranch] =
		useState(false);
	const [newBranchName, setNewBranchName] = useState("");
	const { createBranch, switchBranch } = useGitCommand();

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

	const onClickButtonMerge = async (branchName: string) => {
		await mergeWithCurrentBranch(path.path, branchName);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between bg-muted/50 px-2">
				<div className="flex items-center gap-2">
					<GitBranch className="h-4 w-4" />
					<h2 className="text-sm font-medium">Branches</h2>
				</div>
				<Button
					size="icon"
					variant="ghost"
					onClick={() =>
						setIsCurrentlyCreatingBranch(!isCurrentlyCreatingBranch)
					}
				>
					<Plus />
				</Button>
			</div>
			{isCurrentlyCreatingBranch && (
				<CardHeader className="px-4 py-2">
					<CardTitle className="flex items-center justify-between">
						<Input
							type="text"
							value={newBranchName}
							onChange={(e) => setNewBranchName(e.target.value)}
							className="w-full mr-2 border border-border rounded-md"
							placeholder="Enter branch name"
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={() => createNewBranch(newBranchName)}
						>
							<Check className="h-4 w-4" />
						</Button>
					</CardTitle>
				</CardHeader>
			)}
			<ScrollArea className="h-full">
				<div>
					{isLoading && (
						<div className="flex items-center justify-center h-16">
							<LoaderCircle className="animate-spin" />
						</div>
					)}
					{!branches?.length && !isLoading && (
						<div className="text-center text-sm text-muted">
							No branches found
						</div>
					)}
				</div>
				{branches?.map((branch) => (
					<ContextMenu key={branch.name}>
						<ContextMenuTrigger>
							<NavLink
								to={`branch/${branch.name}/commits`}
								onDoubleClick={() => checkoutBranch(branch.name)}
							>
								{({ isActive }) => (
									<Button
										variant="ghost"
										className={`w-full justify-start gap-2 text-sm ${isActive ? "bg-blue-500" : ""}`}
									>
										{branch.is_head && (
											<span className="h-2 w-2 rounded-full bg-green-500" />
										)}
										{branch.name}
									</Button>
								)}
							</NavLink>
						</ContextMenuTrigger>
						{!branch.is_head && (
							<ContextMenuContent className="w-64">
								<ContextMenuItem
									onClick={() => onClickButtonMerge(branch.name)}
								>
									<span>Merge with current branch</span>
								</ContextMenuItem>
							</ContextMenuContent>
						)}
					</ContextMenu>
				))}
			</ScrollArea>
		</div>
	);
};
