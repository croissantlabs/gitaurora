import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileChange } from "@/hooks/useGitCommand";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	FileIcon,
	MinusIcon,
	PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Checkbox } from "./ui/checkbox";

interface FileChangeProps {
	change: FileChange;
	isSelected?: boolean;
	onSelectChange?: (file: string, isSelected: boolean) => void;
}

export function File({ change, isSelected, onSelectChange }: FileChangeProps) {
	const getStatusIcon = () => {
		switch (change.status) {
			case "added":
				return <PlusIcon className="h-4 w-4 text-green-500" />;
			case "deleted":
				return <MinusIcon className="h-4 w-4 text-red-500" />;
			default:
				return <FileIcon className="h-4 w-4 text-yellow-500" />;
		}
	};

	return (
		<NavLink
			to={`filename/${change.filename}`}
			className="mb-4 last:mb-0 w-full"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					{onSelectChange && (
						<div className="flex items-center">
							<Checkbox
								checked={isSelected}
								onCheckedChange={(checked) =>
									onSelectChange(change.filename, checked as boolean)
								}
							/>
						</div>
					)}
					{getStatusIcon()}
					<span className="text-sm font-medium">{change.filename}</span>
				</div>
			</div>
			{change.diff && (
				<div className="text-xs bg-gray-400 text-black overflow-auto h-100 mt-2 p-2 relative">
					{change.diff.split("\n").map((line, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={line + index}
							className={`
                  select-text
                  w-full
                  min-w-full
                  whitespace-nowrap

                  ${line.startsWith("+") ? "text-black bg-green-100" : ""}
                  ${line.startsWith("-") ? "text-black bg-red-100" : ""}
                `}
						>
							{line}
						</div>
					))}
				</div>
			)}
		</NavLink>
	);
}
