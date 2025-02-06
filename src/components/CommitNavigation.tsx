import type { Commit } from "@/types/git";
import { GitCommit } from "lucide-react";
import { NavLink } from "react-router";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "./ui/context-menu";

interface Props {
	commit: Commit;
}

export const CommitNavigation = ({ commit }: Props) => {
	const onClickButtonCherryPick = async (commitId: string) => {
		console.log("Cherrypicking commit", commitId);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<NavLink
					to={commit.id}
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
					</div>
				</NavLink>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					disabled
					onClick={() => onClickButtonCherryPick(commit.id)}
				>
					<span>Cherrypick Commit</span>
				</ContextMenuItem>
				<ContextMenuItem
					disabled
					onClick={() => onClickButtonCherryPick(commit.id)}
				>
					<span>Amend Commit</span>
				</ContextMenuItem>
				<ContextMenuItem
					disabled
					onClick={() => onClickButtonCherryPick(commit.id)}
				>
					<span>Checkout Commit</span>
				</ContextMenuItem>
				<ContextMenuItem
					disabled
					onClick={() => onClickButtonCherryPick(commit.id)}
				>
					<span>Revert Changes in Commit</span>
				</ContextMenuItem>
				<ContextMenuItem
					disabled
					onClick={() => onClickButtonCherryPick(commit.id)}
				>
					<span>Create Branch from Commit</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
