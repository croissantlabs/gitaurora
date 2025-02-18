import type { Path } from "@/db/dexie";
import { useToast } from "@/hooks/use-toast";
import type { FileChange } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { ArrowBigUp, LoaderCircle, Trash } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { Input } from "./ui/input";

interface Props {
	changes: FileChange[];
	path: Path;
	fetchChanges: () => void;
	fetchCommits: () => void;
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

const commitChanges = async (
	directory: string,
	commitMessage: string,
	files: string[],
): Promise<void> => {
	try {
		await invoke("git_add_and_commit", {
			directory,
			commitMessage,
			files,
		});
	} catch (error) {
		console.error("Error committing changes:", error);
		throw error;
	}
};

const discardChanges = async (
	directory: string,
): Promise<void> => {
	try {
		await invoke("discard_changes", {
			directory,
		});
	} catch (error) {
		console.error("Error discarding changes:", error);
		throw error;
	}
};

export const CurrentChangeInterface = ({
	changes,
	path,
	fetchChanges,
	fetchCommits,
}: Props) => {
	const [selectedFiles, setSelectedFiles] = useState<string[]>(
		changes.map((change) => change.path),
	);
	const { toast } = useToast();

	const [commitMessage, setCommitMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingPush, setIsLoadingPush] = useState(false);
	const [isLoadingDiscard, setIsLoadingDiscard] = useState(false);

	const onClickButtonDiscard = async () => {
		setIsLoadingDiscard(true);
		try {
			await discardChanges(path.path);
			toast({
				title: "Changes Discarded",
				description: "Changes have been discarded successfully",
				duration: 3000,
			});
			await fetchChanges();
		} catch (error) {
			console.error("Error discarding changes:", error);
			toast({
				title: "Error",
				description: "Failed to discard changes",
				variant: "destructive",
				duration: 3000,
			});
		}
		setIsLoadingDiscard(false);
	};

	const onClickButtonCommit = async () => {
		setIsLoading(true);
		try {
			await commitChanges(path.path, commitMessage, selectedFiles);
			toast({
				title: "Changes Committed",
				description: "Changes have been committed successfully",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error committing changes:", error);
		}
		await fetchChanges();
		await fetchCommits();
		setCommitMessage("");
		setIsLoading(false);
	};

	const onClickButtonPush = async () => {
		setIsLoadingPush(true);
		await pushCurrentBranch(path.path);
		setIsLoadingPush(false);
	};

	const handleSelectChange = (file: string, isSelected: boolean) => {
		setSelectedFiles((prev) =>
			isSelected ? [...prev, file] : prev.filter((f) => f !== file),
		);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="bg-muted/50 px-2 flex items-center justify-between">
				<h2 className="text-sm font-medium">{changes?.length} files changed</h2>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size={"sm"}
								variant={"ghost"}
								disabled={isLoadingDiscard}
								onClick={onClickButtonDiscard}
							>
								{isLoadingDiscard ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<Trash />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Discard Changes</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<ScrollArea className="h-full">
				<div className="flex flex-col p-2 gap-2">
					{changes?.map((change, index) => (
						<NavLink
							to={`filename/${index}`}
							key={change.path}
							className="overflow-hidden"
						>
							{({ isActive }) => (
								<div className="px-2 flex items-center gap-2">
									<Checkbox
										checked={selectedFiles.includes(change.path)}
										onCheckedChange={(checked) =>
											handleSelectChange(change.path, checked as boolean)
										}
									/>
									<Button
										variant="ghost"
										className={`w-full justify-start gap-2 text-sm ${isActive ? "bg-blue-500" : ""}`}
									>
										{change.path}
									</Button>
								</div>
							)}
						</NavLink>
					))}
				</div>
			</ScrollArea>

			<div className="flex flex-col p-4">
				<div>
					<Input
						placeholder="Commit message"
						value={commitMessage}
						onChange={(e) => setCommitMessage(e.target.value)}
						className="my-2"
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						onClick={onClickButtonCommit}
						disabled={isLoading || !commitMessage || selectedFiles.length === 0}
						className="flex-1"
						size={"sm"}
					>
						{isLoading ? (
							<LoaderCircle className="animate-spin" />
						) : (
							"Commit Changes"
						)}
					</Button>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button
									variant={"outline"}
									disabled={isLoadingPush}
									onClick={onClickButtonPush}
								>
									{isLoadingPush ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<ArrowBigUp />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>Push</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		</div>
	);
};
