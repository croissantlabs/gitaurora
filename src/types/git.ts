export interface GitCommit {
	id: string;
	message: string;
	author: string;
	timestamp: string;
	parents: string[];
	branch: string;
}

export interface GraphNode {
	commit: GitCommit;
	x: number;
	y: number;
	connections: Array<{
		targetId: string;
		points: Array<{ x: number; y: number }>;
	}>;
}
