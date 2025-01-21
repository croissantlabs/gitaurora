import type { Path } from "@/db/dexie";

import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { CurrentChangeInterface } from "./CurrentChangeInterface";

import type { FileChange } from "@/types/git";
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
		const change: FileChange[] = await invoke("get_all_changed_files", {
			directory,
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

interface CurrentChangeDiffContext {
	path: Path;
	fetchCommits: () => void;
}

export const CurrentChangeLayout = () => {
	const context = useOutletContext<CurrentChangeDiffContext>();
	const { path, fetchCommits } = context;
	console.log(context);
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
				<CurrentChangeInterface
					changes={changes}
					path={path}
					fetchChanges={fetchChanges}
					fetchCommits={fetchCommits}
				/>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				{changes.length ? (
					<Outlet context={{ fileChanges: changes, path }} />
				) : (
					<div />
				)}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
