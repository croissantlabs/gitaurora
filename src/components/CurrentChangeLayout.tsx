import type { Path } from "@/db/dexie";

import { type FileChange, useGitCommand } from "@/hooks/useGitCommand";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { CurrentChangeInterface } from "./CurrentChangeInterface";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";

export const CurrentChangeLayout = () => {
	const path = useOutletContext<Path>();
	const [changes, setChanges] = useState<FileChange[]>([]);
	const { getCurrentChangeFile } = useGitCommand();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (path.path) {
			const fetchChanges = async () => {
				const uncommittedChanges = await getCurrentChangeFile(path.path);
				setChanges(uncommittedChanges);
			};

			fetchChanges();

			const intervalId = setInterval(fetchChanges, 2000);

			return () => clearInterval(intervalId);
			// Cleanup function to clear the interval when the component unmounts
		}
	}, []);

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel className="overflow-hidden" defaultSize={25}>
				{changes?.length ? (
					<CurrentChangeInterface changes={changes} path={path} />
				) : (
					<div className="p-4">No change</div>
				)}
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>
				<Outlet context={changes} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
