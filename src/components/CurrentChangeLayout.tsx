import type { Path } from "@/db/dexie";

import type { FileChange } from "@/hooks/useGitCommand";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { CurrentChangeInterface } from "./CurrentChangeInterface";

import { invoke } from "@tauri-apps/api/core";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

const getCurrentChangeFile = async (
	directory: string,
): Promise<FileChange[]> => {
	try {
		const change: FileChange[] = await invoke("get_current_changes_status", {
			currentPath: directory,
		});

		return change;
	} catch (error) {
		console.error("Error getting current change:", error);
		throw error;
	}
};

function compareTwoArrays(arr1: FileChange[], arr2: FileChange[]) {
	return JSON.stringify(arr1) === JSON.stringify(arr2);
}

export const CurrentChangeLayout = () => {
	const path = useOutletContext<Path>();
	const [changes, setChanges] = useState<FileChange[]>([]);

	const fetchChanges = async () => {
		const uncommittedChanges = await getCurrentChangeFile(path.path);
		if (!compareTwoArrays(uncommittedChanges, changes)) {
			setChanges(uncommittedChanges);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (path.path) {
			fetchChanges();
			const intervalId = setInterval(fetchChanges, 2000);

			return () => clearInterval(intervalId);
		}
	}, []);

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel className="overflow-hidden" defaultSize={25}>
				{changes?.length > 0 && (
					<CurrentChangeInterface
						changes={changes}
						path={path}
						fetchChanges={fetchChanges}
					/>
				)}
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				<Outlet context={changes} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
