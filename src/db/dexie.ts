import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid";

interface gitauroraDB extends Dexie {
	paths: Dexie.Table<Path, number>;
}

const db = new Dexie("gitaurora_db") as gitauroraDB;
db.version(1.1).stores({
	paths: "++id, uuid, path, folderName",
});

export interface Path {
	id?: number;
	uuid: string;
	path: string;
	folderName: string;
}

export const savePath = async (currentPath: string) => {
	try {
		const uuid = uuidv4();
		console.log(uuid);
		const path: Path = {
			uuid,
			path: currentPath,
			folderName: currentPath.split("/").pop() || "",
		};
		console.log(path);
		await db.paths.add({ ...path });
		console.log("Path saved successfully");

		return path;
	} catch (error) {
		console.error("Failed to save path:", error);
	}
};

// a function to remplace all the path by an array of paths
export const savePaths = async (allPaths: Path[]) => {
	try {
		await db.paths.bulkAdd(allPaths);
		console.log("Paths saved successfully");
	} catch (error) {
		console.error("Failed to save paths:", error);
	}
};

export { db };
