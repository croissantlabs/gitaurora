import type { Commit } from "@/hooks/useGitCommand";
import { GitCommit } from "lucide-react";
import { NavLink } from "react-router";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	commits: Commit[];
}

export const CommitHistoryInterface = ({ commits }: Props) => {
	return (
		<ScrollArea className="border-r border-border h-full">
			<ul>
				{commits?.map((commit) => (
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
							<div className="text-sm text-muted-foreground">
								{commit.author} - {commit.date}
							</div>
						</div>
					</NavLink>
				))}
			</ul>
		</ScrollArea>
	);
};
