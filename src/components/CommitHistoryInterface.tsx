import type { Commit } from "@/types/git";
import { File, GitCommit } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	commits: Commit[];
}

export const CommitHistoryInterface = ({ commits }: Props) => {
	return (
		<div className="border-r border-border h-full flex flex-col">
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
			<ScrollArea className="h-full">
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
								{commit.author} - {commit.timestamp}
							</div>
						</div>
					</NavLink>
				))}
			</ScrollArea>
		</div>
	);
};
