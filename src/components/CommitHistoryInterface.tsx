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
	isLoadingCommits,
}: Props) => {
	return (
		<div className="border-r border-border h-full flex flex-col">
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
