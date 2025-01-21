import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Path } from "@/db/dexie";
import { useGitCommand } from "@/hooks/useGitCommand";
import type { Branch } from "@/types/git";
import { Check, GitBranch, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { BranchNavigation } from "./BranchNavigation";

interface Props {
	path: Path;
	branches: Branch[];
	fetchBranches: () => void;
	isLoadingBranches: boolean;
}

export const BranchInterface = ({
	path,
	branches,
	fetchBranches,
	isLoadingBranches,
}: Props) => {
	const navigate = useNavigate();
	const [isCurrentlyCreatingBranch, setIsCurrentlyCreatingBranch] =
		useState(false);
	const [newBranchName, setNewBranchName] = useState("");
	const { createBranch } = useGitCommand();

	const createNewBranch = async (branchName: string) => {
		try {
			await createBranch(path.path, branchName);
			await fetchBranches();
			setIsCurrentlyCreatingBranch(false);
			setNewBranchName("");
			navigate(`/dashboard/path/${path.uuid}/branch/${branchName}/commits`);
		} catch (error) {
			console.error(error);
		}
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
					{isLoadingBranches && (
						<div className="flex items-center justify-center h-16">
							<LoaderCircle className="animate-spin" />
						</div>
					)}
					{!branches?.length && !isLoadingBranches && (
						<div className="text-center text-sm text-muted">
							No branches found
						</div>
					)}
				</div>
				{branches?.map((branch) => (
					<BranchNavigation
						key={branch.name}
						branch={branch}
						fetchBranches={fetchBranches}
						path={path}
					/>
				))}
			</ScrollArea>
		</div>
	);
};
