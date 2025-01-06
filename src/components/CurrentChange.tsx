import { type Path, db } from "@/db/dexie";
import { type Commit, useGitCommand } from "@/hooks/useGitCommand";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface CurrentChangeProps {
	path: Path;
}

export const CurrentChange = ({ path }: CurrentChangeProps) => {
	const { getCurrentChange } = useGitCommand();
	const [currentChange, setCurrentChange] = useState<Commit>();

	useEffect(() => {
		const fetchCurrentChange = async () => {
			const currentChanged = await getCurrentChange(path.path);

			console.log(currentChanged);
			setCurrentChange(currentChanged);
		};

		fetchCurrentChange();
	}, []);

	return (
		<div className="p-4 border-r border-border flex h-full">
			<h2 className="text-xl font-bold">Current Change</h2>
		</div>
	);
};

export const CurrentChangeContainer = () => {
	const { pathId } = useParams();

	const path = useLiveQuery(
		() => db.paths.where({ uuid: pathId }).first(),
		[pathId],
	);

	if (!path) {
		return <div>Loading...</div>;
	}

	return <CurrentChange path={path} />;
};
