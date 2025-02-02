import type { Branch, Commit } from "@/types/git";
import { File, LoaderCircle } from "lucide-react";
import { NavLink } from "react-router";
import { CommitNavigation } from "./CommitNavigation";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	commits: Commit[];
	branch: Branch;
	isLoadingCommits: boolean;
}

export const CommitHistoryInterface = ({
	commits,
	branch,
	isLoadingCommits,
}: Props) => {
	return (
		<div className="border-r border-border h-full flex flex-col">
			{branch.is_head && (
				<NavLink to={"current_change"} className={"flex items-center p-2"}>
					{({ isActive }) => (
						<>
							<File className="mr-2" size={18} />
							<Button
								className={`w-full gap-2 ${isActive ? "bg-blue-500" : ""}`}
								variant={"secondary"}
							>
								<div className="text-sm">Changes</div>
							</Button>
						</>
					)}
				</NavLink>
			)}
			<ScrollArea className="h-full">
				{isLoadingCommits && (
					<div className="flex items-center justify-center h-100 w-100">
						<LoaderCircle className="animate-spin" />
					</div>
				)}
				{commits?.map((commit) => (
					<CommitNavigation key={commit.id} commit={commit} />
				))}
			</ScrollArea>
		</div>
	);
};
