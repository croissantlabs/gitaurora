import { Button } from "@/components/ui/button";
import type { Path } from "@/db/dexie";
import { GitCommit } from "lucide-react";
import { Outlet, useOutletContext, useParams } from "react-router";

export const CommitLayout = () => {
	const path = useOutletContext<Path>();
	const { branchId } = useParams();

	if (!branchId) {
		return null;
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between bg-muted/50 px-2">
				<div className="flex items-center gap-2">
					<GitCommit className="h-4 w-4" />
					<h2 className="text-sm font-medium">Commits</h2>
				</div>
				<Button size="icon" variant="ghost" />
			</div>
			<Outlet context={path} />
		</div>
	);
};
