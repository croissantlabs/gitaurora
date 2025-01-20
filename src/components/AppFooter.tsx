import type { Path } from "@/db/dexie";
import { useToast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";
import {
	ArrowBigDown,
	ArrowBigUp,
	GitPullRequest,
	LoaderCircle,
	LoaderPinwheel,
	MergeIcon,
} from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

interface Props {
	path: Path;
}

const pushCurrentBranch = async (directory: string): Promise<void> => {
	try {
		await invoke("push_current_branch", {
			directory,
		});
	} catch (error) {
		console.error("Error committing changes:", error);
		throw error;
	}
};

const fetch = async (directory: string): Promise<void> => {
	try {
		await invoke("fetch", {
			directory,
		});
	} catch (error) {
		console.error("Error committing changes:", error);
		throw error;
	}
};

const pull = async (directory: string): Promise<void> => {
	try {
		await invoke("pull", {
			directory,
		});
	} catch (error) {
		console.error("Error committing changes:", error);
		throw error;
	}
};

export const AppFooter = ({ path }: Props) => {
	const [isLoadingPush, setIsLoadingPush] = useState(false);
	const [isLoadingFetch, setIsLoadingFetch] = useState(false);
	const [isLoadingPull, setIsLoadingPull] = useState(false);
	const { toast } = useToast();

	const onClickButtonPush = async () => {
		setIsLoadingPush(true);
		try {
			await pushCurrentBranch(path.path);
			toast({
				title: "Changes pushed",
				description: "Changes pushed successfully",
				duration: 3000,
			});
		} catch (error) {
			toast({
				title: "Error pushing changes",
				description: error as string,
				variant: "destructive",
			});
		}

		setIsLoadingPush(false);
	};

	const onClickButtonFetch = async () => {
		setIsLoadingFetch(true);
		await fetch(path.path);
		setIsLoadingFetch(false);
	};

	const onClickButtonPull = async () => {
		setIsLoadingPull(true);
		await pull(path.path);
		setIsLoadingPull(false);
	};

	return (
		<footer className="flex items-center justify-between px-4 py-1 bg-card border-t border-b border-border">
			<div className="flex items-center justify-between w-full">
				<div className="flex space-x-4 items-center">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={onClickButtonFetch}
								>
									<LoaderPinwheel
										className={`h-4 w-4 ${isLoadingFetch ? "animate-spin" : ""}`}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Fetch</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={onClickButtonPush}
									disabled={isLoadingPush}
								>
									{isLoadingPush ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<ArrowBigUp className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Push</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="sm" onClick={onClickButtonPull}>
									{isLoadingPull ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<ArrowBigDown className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Pull --rebase</p>
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
				<div className="flex space-x-4">
					<ModeToggle />
				</div>
			</div>
		</footer>
	);
};
