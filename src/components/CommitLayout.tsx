import { Button } from "@/components/ui/button";
import type { Path } from "@/db/dexie";
import { NavLink, Outlet, useOutletContext, useParams } from "react-router";

export const CommitLayout = () => {
	const path = useOutletContext<Path>();
	const { branchId } = useParams();

	if (!branchId) {
		return null;
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center gap-2 p-1 border-b">
				<NavLink to={"current_change"} className={"flex items-center"}>
					{({ isActive }) => (
						<Button
							variant="ghost"
							className={`text-sm ${isActive ? "text-blue-500" : ""}`}
						>
							Changes
						</Button>
					)}
				</NavLink>
				<NavLink to={"commits"} className={"flex items-center"}>
					{({ isActive }) => (
						<Button
							variant="ghost"
							className={`text-sm ${isActive ? "text-blue-500" : ""}`}
						>
							Commits History
						</Button>
					)}
				</NavLink>
			</div>
			<Outlet context={path} />
		</div>
	);
};
