import type { FileChange } from "@/hooks/useGitCommand";
import { DiffFile, DiffModeEnum, DiffView } from "@git-diff-view/react";
import { File, SplitSquareHorizontal } from "lucide-react";
import { useOutletContext, useParams } from "react-router";
import { ScrollArea } from "./ui/scroll-area";
import "@git-diff-view/react/styles/diff-view.css";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export const ChangeDiff = () => {
	const { filenameId } = useParams();
	const context = useOutletContext<FileChange[]>();
	const { theme } = useTheme();
	const [diffViewMode, setDiffViewMode] = useState(DiffModeEnum.Split);

	const change = context?.[Number.parseInt(filenameId || "0")];

	if (change === undefined) {
		return null;
	}

	const onClickButtonChangeDiffView = () => {
		if (diffViewMode === DiffModeEnum.Split) {
			setDiffViewMode(DiffModeEnum.Unified);
		} else {
			setDiffViewMode(DiffModeEnum.Split);
		}
	};

	const diffFile = new DiffFile("", "", "", "", [change.diff], "ts");
	diffFile.init();
	diffFile.buildSplitDiffLines();
	diffFile.buildUnifiedDiffLines();
	const data = diffFile._getFullBundle();
	const stringData = JSON.stringify(data);

	const file = DiffFile.createInstance({}, JSON.parse(stringData));

	return (
		<ScrollArea className="h-full">
			<div className="flex items-center justify-between bg-muted/50">
				<div className="flex items-center gap-2">
					<File className="h-4 w-4" />
					<h2 className="text-sm font-medium">{change?.filename}</h2>
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
