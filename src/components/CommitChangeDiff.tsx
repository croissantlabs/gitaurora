import { DiffFile, DiffModeEnum, DiffView } from "@git-diff-view/react";
import { File, LoaderCircle, SplitSquareHorizontal } from "lucide-react";
import { useOutletContext, useParams } from "react-router";
import { ScrollArea } from "./ui/scroll-area";
import "@git-diff-view/react/styles/diff-view.css";
import type { Path } from "@/db/dexie";
import type { FileChange } from "@/types/git";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

interface Props {
	fileDiff: string;
	filename: string;
}

export const CommitChangeDiff = ({ fileDiff, filename }: Props) => {
	const { theme } = useTheme();
	const [diffViewMode, setDiffViewMode] = useState(DiffModeEnum.Unified);

	const onClickButtonChangeDiffView = () => {
		if (diffViewMode === DiffModeEnum.Split) {
			setDiffViewMode(DiffModeEnum.Unified);
		} else {
			setDiffViewMode(DiffModeEnum.Split);
		}
	};

	const parts = filename?.split(".");
	const extension = parts[parts.length - 1];

	const diffFile = new DiffFile("", "", "", "", [fileDiff], extension);
	diffFile.init();
	diffFile.buildSplitDiffLines();
	diffFile.buildUnifiedDiffLines();
	const data = diffFile._getFullBundle();
	const stringData = JSON.stringify(data);
	const file = DiffFile.createInstance({}, JSON.parse(stringData));

	return (
		<ScrollArea className="h-full">
			<div className="flex items-center justify-between bg-muted/50 px-2">
				<div className="flex items-center gap-2">
					<File className="h-4 w-4" />
					<h2 className="text-sm font-medium">{filename}</h2>
				</div>
				<Button
					onClick={onClickButtonChangeDiffView}
					variant={"outline"}
					size={"sm"}
				>
					<SplitSquareHorizontal />
				</Button>
			</div>
			<div className="text-xs text-black overflow-x-auto h-100 select-text">
				<DiffView
					diffFile={file}
					diffViewHighlight
					diffViewMode={diffViewMode}
					diffViewWrap
					diffViewFontSize={14}
					diffViewTheme={theme === "dark" ? "dark" : "light"}
				/>
			</div>
		</ScrollArea>
	);
};

const getDiffOfFileInCommit = async (
	directory: string,
	commitHash: string,
	filename: string,
): Promise<string> => {
	try {
		const diff: string = await invoke("get_diff_of_file_in_commit", {
			directory,
			commitHash,
			filename,
		});

		return diff;
	} catch (error) {
		console.error("Error getting diff of file in commit:", error);
		throw error;
	}
};

interface CommitChangeDiffContext {
	files: FileChange[];
	path: Path;
}

export const CommitChangeDiffContainer = () => {
	const { filenameId, commitId } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const context = useOutletContext<CommitChangeDiffContext>();
	const [fileDiff, setFile] = useState<string>();
	const { path, files } = context;
	const filename = files?.[Number(filenameId) || 0]?.path;

	const fetchCurrentChange = async () => {
		setIsLoading(true);
		if (commitId && path?.path) {
			const change = await getDiffOfFileInCommit(path.path, commitId, filename);

			setFile(change);
			setIsLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchCurrentChange();
	}, [filenameId]);

	if (isLoading || !fileDiff) {
		return (
			<div className="flex h-full items-center w-full justify-center">
				<LoaderCircle className="animate-spin" />
			</div>
		);
	}

	return <CommitChangeDiff fileDiff={fileDiff} filename={filename} />;
};
