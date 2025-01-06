import { Button } from "@/components/ui/button";
import { db, savePath } from "@/db/dexie";
import { open } from "@tauri-apps/plugin-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const SelectDirectoryView = () => {
	const paths = useLiveQuery(() => db.paths.toArray());
	const navigate = useNavigate();
	const selectDirectory = async () => {
		try {
			const selected = await open({
				directory: true,
				multiple: false,
				defaultPath: "~",
			});

			if (selected) {
				console.log(selected);
				const path = await savePath(selected);
				console.log(path);
				navigate(`/dashboard/path/${path?.uuid}`);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (paths && paths?.length > 0) {
			navigate(`/dashboard/path/${paths[0].uuid}`);
		}
	}, [paths, navigate]);

	return (
		<div className="flex flex-col h-screen bg-background text-foreground">
			<div className="flex items-center justify-center h-full">
				<Button onClick={selectDirectory}>Select a directory</Button>
			</div>
		</div>
	);
};

export default SelectDirectoryView;
