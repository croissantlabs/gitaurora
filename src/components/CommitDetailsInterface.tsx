import type { FileChange } from "@/types/git";
import { NavLink } from "react-router";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	files: FileChange[];
}

export const CommitDetailsInterface = ({ files }: Props) => {
	return (
		<ScrollArea className="border-r border-border flex h-full">
			<div className="bg-muted/50 p-2">
				<h2 className="text-sm font-medium">{files?.length} files changed</h2>
			</div>
			{files?.map((change, index) => (
				<NavLink
					key={change.path}
					to={`filename/${index}`}
					className={({ isActive }) =>
						`flex items-center py-2 px-4 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : ""}`
					}
				>
					{change.path}
				</NavLink>
			))}
		</ScrollArea>
	);
};
