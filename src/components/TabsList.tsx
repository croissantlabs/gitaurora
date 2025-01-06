import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type Path, db, savePath } from "@/db/dexie";
import { open } from "@tauri-apps/plugin-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { Cross, CrossIcon, Plus, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

export default function TabList() {
	const navigate = useNavigate();
	const paths = useLiveQuery(() => db.paths.toArray());

	const addNewTab = async () => {
		try {
			const selected = await open({
				directory: true,
				multiple: false,
				defaultPath: "~",
			});

			if (selected) {
				const path = await savePath(selected);
				navigate(`/dashboard/path/${path?.uuid}`);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const closeTab = async (uuid: string) => {
		try {
			await db.paths.where("uuid").equals(uuid).delete();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="w-screen">
			<ScrollArea className="border-b border-border whitespace-nowrap">
				<div className="flex items-center w-max space-x-4">
					{paths?.map((path: Path) => (
						<NavLink
							to={`/dashboard/path/${path.uuid}`}
							key={path.uuid}
							className={({ isActive }) =>
								`pl-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
									isActive
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`
							}
						>
							<div className="flex items-center justify-between">
								{path.folderName}
								<Button
									size={"sm"}
									variant="ghost"
									className="ml-4"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										closeTab(path.uuid);
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</NavLink>
					))}
					<Button
						onClick={addNewTab}
						variant="outline"
						size="icon"
						className="ml-2"
						aria-label="Add new tab"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}
