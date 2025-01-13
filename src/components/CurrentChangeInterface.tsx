import { Textarea } from "@/components/ui/textarea";
import type { Path } from "@/db/dexie";
import type { FileChange } from "@/hooks/useGitCommand";
import { invoke } from "@tauri-apps/api/core";
import { ArrowBigUp, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { CardFooter } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

interface Props {
	changes: FileChange[];
	path: Path;
	fetchChanges: () => void;
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

export const CurrentChangeInterface = ({
	changes,
	path,
	fetchChanges,
}: Props) => {
	const [selectedFiles, setSelectedFiles] = useState<string[]>(
		changes.map((change) => change.filename),
	);

	const [commitMessage, setCommitMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingPush, setIsLoadingPush] = useState(false);

	const onClickButtonCommit = async () => {
		setIsLoading(true);
		await commitChanges(path.path, commitMessage, selectedFiles);
		await fetchChanges();
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
			<ScrollArea className="h-full">
				<div className="flex flex-col p-2 gap-2">
					{changes?.map((change, index) => (
						<NavLink
							to={`filename/${index}`}
							key={change.filename}
							className="overflow-hidden"
						>
							{({ isActive }) => (
								<div className="px-2 flex items-center gap-2">
									<Checkbox
										checked={selectedFiles.includes(change.filename)}
										onCheckedChange={(checked) =>
											handleSelectChange(change.filename, checked as boolean)
										}
									/>
									<Button
										variant="ghost"
										className={`w-full justify-start gap-2 text-sm ${isActive ? "bg-blue-500" : ""}`}
									>
										{change.filename}
									</Button>
								</div>
							)}
						</NavLink>
					))}
				</div>
			</ScrollArea>

			<CardFooter className="flex flex-col items-stretch gap-4 pt-4">
				<Textarea
					placeholder="Enter commit message"
					value={commitMessage}
					onChange={(e) => setCommitMessage(e.target.value)}
				/>
				<div className="flex items-center space-x-2">
					<Button
						onClick={onClickButtonCommit}
						disabled={isLoading || !commitChanges}
						className="flex-1"
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
			</CardFooter>
		</div>
	);
};
