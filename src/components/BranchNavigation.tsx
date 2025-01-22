import type { Path } from "@/db/dexie";
import type { Branch } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "./ui/context-menu";

interface Props {
	branch: Branch;
	path: Path;
	fetchBranches: () => void;
}

const switchBranch = async (
	directory: string,
	branchName: string,
): Promise<void> => {
	try {
		await invoke("switch_branch", {
			currentPath: directory,
			branchName,
		});
	} catch (error) {
		console.error("Error creating Git branch:", error);
		throw error;
	}
};

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

export const BranchNavigation = ({ branch, path, fetchBranches }: Props) => {
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

	if (branch.is_remote) {
		return null;
	}

	return (
		<ContextMenu>
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
					<ContextMenuItem onClick={() => onClickButtonMerge(branch.name)}>
						<span>Merge with current branch</span>
					</ContextMenuItem>
					<ContextMenuItem disabled>
						<span>Remove branch</span>
					</ContextMenuItem>
				</ContextMenuContent>
			)}
		</ContextMenu>
	);
};
