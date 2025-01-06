import { Button } from "@/components/ui/button";
import type { FileChange } from "@/hooks/useGitCommand";
import { ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";

interface FileChangesProps {
	changes: FileChange[];
}

export default function FileChanges({ changes }: FileChangesProps) {
	const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

	const toggleFile = (filename: string) => {
		const newExpandedFiles = new Set(expandedFiles);
		if (newExpandedFiles.has(filename)) {
			newExpandedFiles.delete(filename);
		} else {
			newExpandedFiles.add(filename);
		}
		setExpandedFiles(newExpandedFiles);
	};

	return (
		<div className="mt-4">
			<h3 className="text-lg font-semibold mb-2">File Changes</h3>
			{changes.map((change) => (
				<div key={change.filename} className="mb-2">
					<Button
						variant="ghost"
						className="w-full justify-start text-left"
						onClick={() => toggleFile(change.filename)}
					>
						{expandedFiles.has(change.filename) ? (
							<ChevronDown className="mr-2" size={16} />
						) : (
							<ChevronRight className="mr-2" size={16} />
						)}
						<span
							className={`mr-2 ${change.status === "added" ? "text-green-500" : change.status === "deleted" ? "text-red-500" : "text-yellow-500"}`}
						>
							{change.status === "added" ? (
								<Plus size={16} />
							) : change.status === "deleted" ? (
								<Minus size={16} />
							) : (
								"●"
							)}
						</span>
						{change.filename}
					</Button>
					{expandedFiles.has(change.filename) && (
						<pre className="bg-muted text-muted-foreground p-2 mt-1 overflow-x-auto text-sm">
							{change.diff}
						</pre>
					)}
				</div>
			))}
		</div>
	);
}
