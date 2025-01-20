use git2::{Repository, BranchType, Oid, Error, DiffOptions, Tree, ObjectType, DiffFormat, DiffLine, DiffDelta, DiffHunk, Status, StatusOptions};
use serde::Serialize;

#[derive(Serialize)]
pub struct Branch {
    name: String,
    is_remote: bool,
    is_head: bool,
}

#[tauri::command]
pub async fn get_branch_list(directory: String) -> Vec<Branch> {
    tokio::task::spawn_blocking(move || {
        let mut branch_list = Vec::new();

        match Repository::open(directory) {
            Ok(repo) => {
                if let Ok(branches) = repo.branches(None) {
                    for branch_result in branches {
                        if let Ok((branch, branch_type)) = branch_result {
                            if let Ok(branch_name) = branch.name() {
                                if let Some(name) = branch_name {
                                    branch_list.push(Branch {
                                        name: name.to_string(),
                                        is_remote: branch_type == BranchType::Remote,
                                        is_head: branch.is_head(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
            Err(err) => {
                eprintln!("Failed to open repository: {}", err);
            }
        }

        branch_list
    })
    .await
    .unwrap_or_else(|_| Vec::new()) // Handle potential panics
}

#[derive(Serialize)]
pub struct Commit {
    id: String,
    author: String,
    email: String,
    message: String,
    timestamp: i64,
}

#[tauri::command]
pub async fn get_all_commits_from_branch(directory: String, branch: String) -> Result<Vec<Commit>, String> {
    // Open the repository
    let repo = Repository::open(directory).map_err(|err| format!("Failed to open repository: {}", err))?;

    // Find the branch reference
    let branch_ref = repo.find_reference(&format!("refs/heads/{}", branch))
        .map_err(|err| format!("Failed to find branch {}: {}", branch, err))?;

    // Resolve the branch reference to an OID (commit hash)
    let branch_oid = branch_ref.target()
        .ok_or_else(|| "Branch reference does not point to a valid commit.".to_string())?;

    // Find the commit corresponding to the branch
    let mut revwalk = repo.revwalk()
        .map_err(|err| format!("Failed to create revwalk: {}", err))?;

    revwalk.push(branch_oid)
        .map_err(|err| format!("Failed to push branch OID to revwalk: {}", err))?;

    // Collect commits
    let mut commits = Vec::new();
    for oid_result in revwalk {
        let oid = oid_result.map_err(|err| format!("Failed to get OID from revwalk: {}", err))?;
        let commit = repo.find_commit(oid)
            .map_err(|err| format!("Failed to find commit for OID {}: {}", oid, err))?;

        let author = commit.author();
        commits.push(Commit {
            id: commit.id().to_string(),
            author: author.name().unwrap_or("").to_string(),
            email: author.email().unwrap_or("").to_string(),
            message: commit.message().unwrap_or("").to_string(),
            timestamp: commit.time().seconds(),
        });
    }

    Ok(commits)
}

// a function to get all the files changed in a commit
#[derive(Serialize)]
pub struct FileChange {
    path: String,
    status: String,
}

#[tauri::command]
pub fn get_changed_files_in_commit(directory: String, commit_hash: String) -> Vec<FileChange> {
    let repo = Repository::open(directory).expect("Failed to open repository");
    let commit_oid = Oid::from_str(&commit_hash).expect("Invalid commit hash");
    let commit = repo.find_commit(commit_oid).expect("Failed to find commit");

    let parent = commit.parent(0).expect("Failed to get parent commit");
    let parent_tree = parent.tree().expect("Failed to get parent tree");
    let commit_tree = commit.tree().expect("Failed to get commit tree");

    let mut diff_opts = DiffOptions::new();
    let diff = repo.diff_tree_to_tree(Some(&parent_tree), Some(&commit_tree), Some(&mut diff_opts))
        .expect("Failed to create diff");

    let mut file_changes = Vec::new();

    diff.foreach(&mut |delta, _| {
        if let Some(path) = delta.new_file().path() {
            let status = match delta.status() {
                git2::Delta::Added => "Added",
                git2::Delta::Deleted => "Deleted",
                git2::Delta::Modified => "Modified",
                git2::Delta::Renamed => "Renamed",
                _ => "Other",
            };
            file_changes.push(FileChange {
                path: path.to_string_lossy().into_owned(),
                status: status.to_string(),
            });
        }
        true
    }, None, None, None).expect("Failed to iterate over diff");

    file_changes
}

use std::path::Path;

#[tauri::command]
pub async fn get_diff_of_file_in_commit(directory: String, commit_hash: String, filename: String) -> Result<String, String> {
    let repo = Repository::open(directory).map_err(|e| e.to_string())?;
    let commit = repo.find_commit(repo.revparse_single(&commit_hash).map_err(|e| e.to_string())?.id()).map_err(|e| e.to_string())?;
    let parent = commit.parent(0).map_err(|e| e.to_string())?;

    let mut diff_options = DiffOptions::new();
    diff_options.pathspec(filename);

    let diff = repo.diff_tree_to_tree(
        Some(&parent.tree().map_err(|e| e.to_string())?),
        Some(&commit.tree().map_err(|e| e.to_string())?),
        Some(&mut diff_options)
    ).map_err(|e| e.to_string())?;

    let mut diff_output = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        use std::str;
        if let Ok(content) = str::from_utf8(line.content()) {
            diff_output.push_str(&format!("{}{}", line.origin(), content));
        }
        true
    }).map_err(|e| e.to_string())?;

    Ok(clean_diff(diff_output))
}

fn clean_diff(diff: String) -> String {
    let mut lines: Vec<&str> = diff.lines().collect();

    // Remove the "F" from the first line if it exists
    if let Some(first_line) = lines.first_mut() {
        if first_line.starts_with('F') {
            *first_line = &first_line[1..];
        }
    }

    // Remove the "H" from the line starting with "@@"
    for line in lines.iter_mut() {
        if line.starts_with("H@@") {
            *line = &line[1..];
        }
    }

    lines.join("\n")
}

// a function to get all the current files changed, added, deleted, or modified
#[tauri::command]
pub async fn get_all_changed_files(directory: String) -> Result<Vec<FileChange>, String> {
    let repo = match Repository::open(Path::new(&directory)) {
        Ok(repo) => repo,
        Err(_) => return Err("Failed to open repository".to_string()),
    };

    let mut opts = StatusOptions::new();
    opts.include_untracked(true)
        .recurse_untracked_dirs(true)
        .include_ignored(false);

    let statuses = match repo.statuses(Some(&mut opts)) {
        Ok(statuses) => statuses,
        Err(_) => return Err("Failed to get repository status".to_string()),
    };

    let mut changes = Vec::new();

    for entry in statuses.iter() {
        let path = match entry.path() {
            Some(path) => path.to_string(),
            None => continue,
        };

        let status = match entry.status() {
            Status::INDEX_NEW | Status::WT_NEW => "Added",
            Status::INDEX_MODIFIED | Status::WT_MODIFIED => "Modified",
            Status::INDEX_DELETED | Status::WT_DELETED => "Deleted",
            Status::INDEX_RENAMED | Status::WT_RENAMED => "Renamed",
            _ => "Other",
        };

        changes.push(FileChange {
            path,
            status: status.to_string(),
        });
    }

    Ok(changes)
}

use std::process::Command;
use std::str::from_utf8;
// a function to get the diff of a file added, changed, or deleted
#[tauri::command]
pub async fn get_diff_of_file(directory: String, filename: String) -> String {
    let changed_files = Command::new("git")
        .current_dir(&directory)
        .args(&["status", "--porcelain"])
        .output()
        .expect("Failed to execute git command");

    let changed_files_str =
        from_utf8(&changed_files.stdout).expect("Failed to parse changed files");

    // Check if the file is in the status list
    let mut file_status = "unknown"; // Default status
    for line in changed_files_str.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }
        if parts[1] == filename {
            file_status = match parts[0] {
                "M" => "modified",
                "A" => "added",
                "D" => "deleted",
                "R" => "renamed",
                "??" => "untracked",
                _ => "unknown",
            };
            break;
        }
    }

    // Only return diff if the file is modified, added, or untracked
    if file_status == "unknown" {
        return "No changes detected for this file.".to_string();
    }

    // Get the diff for the specified file
    let diff = if file_status == "untracked" {
        Command::new("git")
            .current_dir(&directory)
            .args(&["diff", "--unified=3", "/dev/null", &filename])
            .output()
            .expect("Failed to execute git command")
    } else {
        Command::new("git")
            .current_dir(&directory)
            .args(&["diff", "--unified=3", "--", &filename])
            .output()
            .expect("Failed to execute git command")
    };

    let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

    // Return the diff as a string
    diff_str.to_string()
}
