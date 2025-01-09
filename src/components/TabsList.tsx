import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type Path, db, savePath } from "@/db/dexie";
import { open } from "@tauri-apps/plugin-dialog";
import { Plus, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Separator } from "./ui/separator";

interface Props {
	paths: Path[];
}

export default function TabList({ paths }: Props) {
	const navigate = useNavigate();

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
				<div className="flex items-center gap-2 p-2 border-b">
					{paths?.map((path: Path) => (
						<div key={path.uuid} className="flex items-center">
							<NavLink
								to={`/dashboard/path/${path.uuid}`}
								className={"flex items-center"}
							>
								{({ isActive }) => (
									<>
										<Button
											variant="ghost"
											className={`text-sm ${isActive ? "text-blue-500" : ""}`}
										>
											{path.folderName}
										</Button>
										<Button
											size={"icon"}
											variant="ghost"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												closeTab(path.uuid);
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</>
								)}
							</NavLink>
							<Separator orientation="vertical" className="h-4" />
						</div>
					))}
					<Button
						onClick={addNewTab}
						variant="outline"
						size="sm"
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
