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

export interface Branch {
	name: string;
	is_remote: boolean;
	is_head: boolean;
}

export interface Commit {
	id: string;
	author: string;
	email: string;
	message: string;
	timestamp: number;
}

export interface FileChange {
	path: string;
	status: string;
}
