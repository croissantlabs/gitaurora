import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Path } from "@/db/dexie";
import { Outlet, useOutletContext, useParams } from "react-router";
import { AppFooter } from "./AppFooter";
import { BranchInterface } from "./BranchInterface";

export function BranchLayout() {
	const { pathId } = useParams();
	const context = useOutletContext<Path[]>();
	const path = context.find((c) => c.uuid === pathId);

	if (!path) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col flex-1 h-full w-full">
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel className="overflow-hidden h-full" defaultSize={15}>
					<BranchInterface path={path} />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<Outlet context={path} />
				</ResizablePanel>
			</ResizablePanelGroup>
			<AppFooter path={path} />
		</div>
	);
}
