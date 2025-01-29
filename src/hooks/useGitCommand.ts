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
			await invoke("switch_branch", {
				currentPath: directory,
				branchName,
			});
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

	// a function to get the current change of a file
	const getCurrentChangeByFilename = async (
		directory: string,
		filename: string,
	): Promise<FileChange> => {
		try {
			const change: FileChange = await invoke(
				"get_current_change_by_filename",
				{
					currentPath: directory,
					filename,
				},
			);

			return change;
		} catch (error) {
			console.error("Error getting current change:", error);
			throw error;
		}
	};

	const getCurrentChangeFile = async (
		directory: string,
	): Promise<FileChange[]> => {
		try {
			const change: FileChange[] = await invoke("get_current_changes_status", {
				currentPath: directory,
			});

			return change;
		} catch (error) {
			console.error("Error getting current change:", error);
			throw error;
		}
	};

	const getCurrentChange = async (directory: string): Promise<FileChange[]> => {
		try {
			const change: FileChange[] = await invoke("get_current_changes_status", {
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

	// a function to push the current branch
	const pushCurrentBranch = async (directory: string): Promise<void> => {
		try {
			await invoke("push_current_branch", {
				directory,
			});
		} catch (error) {
			console.error("Error committing changes:", error);
			throw error;
		}
	};

	// a function to get the change of a file from a commit
	const getChangeFromCommitByFilename = async (
		directory: string,
		filename: string,
	): Promise<FileChange> => {
		try {
			const change: FileChange = await invoke(
				"get_current_change_by_filename",
				{
					current_path: directory,
					filename,
				},
			);

			return change;
		} catch (error) {
			console.error("Error getting change from commit:", error);
			throw error;
		}
	};

	return {
		getAllGitBranches,
		getCurrentChange,
		getCurrentChangeFile,
		getCurrentChangeByFilename,
		getStagedChange,
		getAllCommitsFromBranch,
		getChangeFromCommit,
		getChangeFromCommitByFilename,
		deleteBranch,
		createBranch,
		switchBranch,
		pushCurrentBranch,
	};
};
