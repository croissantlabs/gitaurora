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
	filename: string;
	diff: string;
}

export const CurrentChangeDiff = ({ filename, diff }: Props) => {
	const { theme } = useTheme();
	const [diffViewMode, setDiffViewMode] = useState(DiffModeEnum.Split);

	const onClickButtonChangeDiffView = () => {
		if (diffViewMode === DiffModeEnum.Split) {
			setDiffViewMode(DiffModeEnum.Unified);
		} else {
			setDiffViewMode(DiffModeEnum.Split);
		}
	};

	console.log(diff);
	const diffFile = new DiffFile("", "", "", "", [diff], "ts");
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

const getDiffOfFile = async (
	directory: string,
	filename: string,
): Promise<string> => {
	try {
		const diff: string = await invoke("get_diff_of_file", {
			directory,
			filename,
		});

		return diff;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

interface CurrentChangeDiffContext {
	fileChanges: FileChange[];
	path: Path;
}

export const CurrentChangeDiffContainer = () => {
	const context = useOutletContext<CurrentChangeDiffContext>();
	const { filenameId } = useParams();
	const [diff, setDiff] = useState<string>("");
	const { fileChanges, path } = context;
	const [isLoading, setIsLoading] = useState(true);
	const filename = fileChanges?.[Number(filenameId)]?.path;

	const getDiff = async () => {
		if (filenameId && path?.path) {
			setIsLoading(true);
			const diff = await getDiffOfFile(path.path, filename);

			console.log(diff);
			setDiff(diff);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getDiff();
	}, [filenameId]);

	if (isLoading || !diff) {
		return (
			<div className="flex items-center justify-center h-full">
				<LoaderCircle className="animate-spin h-8 w-8" />
			</div>
		);
	}

	return <CurrentChangeDiff filename={filename} diff={diff} />;
};
