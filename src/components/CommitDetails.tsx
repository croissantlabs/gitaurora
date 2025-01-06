import { ScrollArea } from "@/components/ui/scroll-area";
import { type Path, db } from "@/db/dexie";
import { type Commit, useGitCommand } from "@/hooks/useGitCommand";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import FileChanges from "./FileChanges";

interface CommitDetailsProps {
	path: Path;
	commitId: string;
}

export default function CommitDetails({ path, commitId }: CommitDetailsProps) {
	const [commit, setCommit] = useState<Commit>();
	const { getChangeFromCommit } = useGitCommand();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchCommits = async () => {
			const commit = await getChangeFromCommit(path.path, commitId);

			console.log(commit);
			setCommit(commit);
		};
		fetchCommits();
	}, [commitId]);

	if (!commit) {
		return <div className="p-4">Select a commit to view details</div>;
	}

	return (
		<div className="p-4 h-full overflow-hidden">
			<ScrollArea className="flex h-full">
				<h2 className="text-xl font-bold mb-4">Commit Details</h2>
				<div className="mb-4">
					<h3 className="font-semibold">{commit.message}</h3>
					<p className="text-sm text-muted-foreground">
						{commit.author} - {commit.date}
					</p>
				</div>
				{commit.changes && <FileChanges changes={commit.changes} />}
			</ScrollArea>
		</div>
	);
}

export const CommitDetailsContainer = () => {
	const { pathId, commitId } = useParams();

	const path = useLiveQuery(
		() => db.paths.where({ uuid: pathId }).first(),
		[commitId, pathId],
	);

	if (!path || !commitId) {
		return <div>Loading...</div>;
	}

	return <CommitDetails path={path} commitId={commitId} />;
};
