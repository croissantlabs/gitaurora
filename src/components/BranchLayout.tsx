import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Path } from "@/db/dexie";
import type { Branch } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { AppFooter } from "./AppFooter";
import { BranchInterface } from "./BranchInterface";

const getBranchList = async (directory: string): Promise<Branch[]> => {
	try {
		const branches: Branch[] = await invoke("get_branch_list", {
			directory,
		});

		return branches;
	} catch (error) {
		console.error("Error getting all branches:", error);
		throw error;
	}
};

export function BranchLayout() {
	const { pathId } = useParams();
	const context = useOutletContext<Path[]>();
	const path = context.find((c) => c.uuid === pathId);
	const [branches, setBranches] = useState<Branch[]>();

	const fetchBranches = async () => {
		if (path) {
			const allBranches = await getBranchList(path.path);
			setBranches(allBranches);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchBranches();
	}, [pathId]);

	return (
		<div className="flex flex-col flex-1 h-full w-full">
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel className="overflow-hidden h-full" defaultSize={15}>
					{!branches || !path ? (
						<div>
							<LoaderCircle className="animate-spin" />
						</div>
					) : (
						<BranchInterface
							path={path}
							branches={branches}
							fetchBranches={fetchBranches}
						/>
					)}
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					{branches && <Outlet context={{ path, branches }} />}
				</ResizablePanel>
			</ResizablePanelGroup>
			{path && <AppFooter path={path} />}
		</div>
	);
}
