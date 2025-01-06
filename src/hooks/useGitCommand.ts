import { invoke } from "@tauri-apps/api/core";

export interface Branch {
	id: string;
	name: string;
	is_active: boolean;
}

export interface FileChange {
	filename: string;
	status: "added" | "modified" | "deleted";
	diff: string;
}

export interface Commit {
	id: string;
	message: string;
	author: string;
	date: string;
	changes?: FileChange[];
}

export const useGitCommand = () => {
	const getAllGitBranches = async (directory: string): Promise<Branch[]> => {
		try {
			const branches: Branch[] = await invoke("get_all_git_branches", {
				currentPath: directory,
			});

			console.log(directory);

			console.log(branches);

			return branches;
		} catch (error) {
			console.error("Error getting Git branches:", error);
			throw error;
		}
	};

	// get all commits from a branch and return them
	const getAllCommitsFromBranch = async (
		directory: string,
		branchName: string,
	): Promise<Commit[]> => {
		try {
			const commits: Commit[] = await invoke("get_all_commits_from_branch", {
				currentPath: directory,
				branchName,
			});

			return commits;
		} catch (error) {
			console.error("Error getting Git commits:", error);
			throw error;
		}
	};

	const createBranch = async (
		directory: string,
		branchName: string,
	): Promise<void> => {
		try {
			await invoke("create_new_branch", {
				currentPath: directory,
				branchName,
			});
		} catch (error) {
			console.error("Error creating Git branch:", error);
			throw error;
		}
	};

	// function to switch branch
	const switchBranch = async (
		directory: string,
		branchName: string,
	): Promise<void> => {
		try {
			console.log("switching branch");

			await invoke("switch_branch", {
				currentPath: directory,
				branchName,
			});
			console.log(directory, branchName);
		} catch (error) {
			console.error("Error creating Git branch:", error);
			throw error;
		}
	};

	// function to delete branch
	const deleteBranch = async (
		directory: string,
		branchName: string,
	): Promise<void> => {
		try {
			await invoke("delete_branch", {
				currentPath: directory,
				branchName,
			});
		} catch (error) {
			console.error("Error deleting Git branch:", error);
			throw error;
		}
	};

	// a function to get the change of a commit
	const getChangeFromCommit = async (
		directory: string,
		commitId: string,
	): Promise<Commit> => {
		try {
			const change: Commit = await invoke("get_commit_changes", {
				currentPath: directory,
				commitId,
			});

			return change;
		} catch (error) {
			console.error("Error getting change from commit:", error);
			throw error;
		}
	};

	// a function to get the current change not yet committed
	const getCurrentChange = async (directory: string): Promise<Commit> => {
		try {
			const change: Commit = await invoke("get_current_changes", {
				currentPath: directory,
			});

			return change;
		} catch (error) {
			console.error("Error getting current change:", error);
			throw error;
		}
	};

	// a function to get the current change staged
	const getStagedChange = async (directory: string): Promise<Commit> => {
		try {
			const change: Commit = await invoke("get_staged_change", {
				currentPath: directory,
			});

			return change;
		} catch (error) {
			console.error("Error getting staged change:", error);
			throw error;
		}
	};

	return {
		getAllGitBranches,
		getCurrentChange,
		getStagedChange,
		getAllCommitsFromBranch,
		getChangeFromCommit,
		deleteBranch,
		createBranch,
		switchBranch,
	};
};
