import type { Commit } from "@/hooks/useGitCommand";
import { NavLink } from "react-router";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	commit: Commit;
}

export const CommitDetailsInterface = ({ commit }: Props) => {
	return (
		<ScrollArea className="border-r border-border flex h-full">
			<div className="bg-muted/50 p-2">
				<h2 className="text-sm font-medium">
					{commit.changes?.length} files changed
				</h2>
			</div>
			{commit.changes?.map((change, index) => (
				<NavLink
					key={change.filename}
					to={`filename/${index}`}
					className={({ isActive }) =>
						`flex items-center py-2 px-4 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : ""}`
					}
				>
					{change.filename}
				</NavLink>
			))}
		</ScrollArea>
	);
};
