import type { Path } from "@/db/dexie";
import { type FileChange, useGitCommand } from "@/hooks/useGitCommand";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { CardFooter } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

interface Props {
	changes: FileChange[];
	path: Path;
}

export const CurrentChangeInterface = ({ changes, path }: Props) => {
	const [selectedFiles, setSelectedFiles] = useState<string[]>(
		changes.map((change) => change.filename),
	);
	const { commitChanges } = useGitCommand();

	const [commitMessage, setCommitMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchChanges();
	}, []);

	const fetchChanges = async () => {
		setSelectedFiles(changes.map((change) => change.filename));
		handleSelectAll(true);
	};

	const handleCommit = async () => {
		if (!commitMessage.trim()) {
			alert("Please enter a commit message");
			return;
		}

		setIsLoading(true);
		try {
			commitChanges(path.path, commitMessage, selectedFiles);
			setCommitMessage("");
		} catch (error) {
			console.error("Failed to commit changes:", error);
			alert("Failed to commit changes. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		setSelectedFiles(checked ? changes.map((change) => change.filename) : []);
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
						<div key={change.filename} className="px-2 flex items-center gap-2">
							<Checkbox
								checked={selectedFiles.includes(change.filename)}
								onCheckedChange={(checked) =>
									handleSelectChange(change.filename, checked as boolean)
								}
							/>
							<NavLink to={`filename/${index}`} className={"overflow-hidden"}>
								{({ isActive }) => (
									<Button
										variant="ghost"
										className={`w-full justify-start gap-2 text-sm ${isActive ? "bg-blue-400" : ""}`}
									>
										{change.filename}
									</Button>
								)}
							</NavLink>
						</div>
					))}
				</div>
			</ScrollArea>

			<CardFooter className="flex flex-col items-stretch gap-4 pt-4">
				<Textarea
					placeholder="Enter commit message"
					value={commitMessage}
					onChange={(e) => setCommitMessage(e.target.value)}
				/>
				<Button
					onClick={handleCommit}
					disabled={isLoading || changes?.length === 0}
				>
					{isLoading ? "Committing..." : "Commit Changes"}
				</Button>
			</CardFooter>
		</div>
	);
};
