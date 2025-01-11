import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Path } from "@/db/dexie";
import { useGitCommand } from "@/hooks/useGitCommand";
import {
	ArrowBigDown,
	ArrowBigUp,
	GitPullRequest,
	MergeIcon,
} from "lucide-react";
import { Outlet, useOutletContext, useParams } from "react-router";
import { BranchInterface } from "./BranchInterface";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

export function BranchLayout() {
	const { pathId } = useParams();
	const context = useOutletContext<Path[]>();
	const { pushCurrentBranch } = useGitCommand();
	const path = context.find((c) => c.uuid === pathId);

	if (!path) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col flex-1 h-full w-full">
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel className="overflow-hidden h-full" defaultSize={25}>
					<BranchInterface path={path} />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<Outlet context={path} />
				</ResizablePanel>
			</ResizablePanelGroup>
			<footer className="flex items-center justify-between p-4 bg-card border-t border-border">
				<div className="flex items-center space-x-4">
					<ModeToggle />
					<Button
						variant="outline"
						size="sm"
						onClick={() => pushCurrentBranch(path.path)}
					>
						<ArrowBigUp className="mr-2 h-4 w-4" />
						Push
					</Button>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<Button variant="outline" size="sm" disabled>
										<ArrowBigDown className="mr-2 h-4 w-4" />
										Pull
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Feature in coming</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<Button variant="outline" size="sm" disabled>
										<GitPullRequest className="mr-2 h-4 w-4" />
										Create Pull Request
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Feature in coming</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<Button variant="outline" size="sm" disabled>
										<MergeIcon className="mr-2 h-4 w-4" />
										Merge editor
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Feature in coming</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				{/* <div className="flex items-center space-x-4">
					<span>Current Branch: main</span>
					<span>Last Fetch: 5 minutes ago</span>
				</div> */}
			</footer>
		</div>
	);
}
