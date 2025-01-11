// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use std::process::Command;
use std::str::from_utf8;

#[derive(Serialize)]
struct Branch {
    id: String,
    name: String,
    is_active: bool,
}

#[tauri::command]
fn push_current_branch (directory: String) -> Result<(), String> {
    let output = Command::new("git")
        .arg("push")
        .current_dir(directory)
        .output()
        .expect("Failed to execute git command");

        Ok(())
}

#[tauri::command]
fn git_add_and_commit(
    directory: String,
    commit_message: String,
    files: Vec<String>,
) -> Result<(), String> {
    // Git add
    let mut add_command = Command::new("git");
    add_command.current_dir(directory.clone());
    add_command.arg("add");

    for file in files {
        add_command.arg(file);
    }

    let add_output = add_command.output().map_err(|e| e.to_string())?;

    if !add_output.status.success() {
        return Err(String::from_utf8_lossy(&add_output.stderr).to_string());
    }

    // Git commit
    let commit_output = Command::new("git")
        .args(&["commit", "-m", &commit_message])
        .current_dir(directory)
        .output()
        .map_err(|e| e.to_string())?;

    if !commit_output.status.success() {
        return Err(String::from_utf8_lossy(&commit_output.stderr).to_string());
    }

    Ok(())
}

#[tauri::command]
fn get_all_git_branches(current_path: String) -> Vec<Branch> {
    let output = Command::new("git")
        .arg("branch")
        .current_dir(current_path)
        .output()
        .expect("Failed to execute git command");

    let branches = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .lines()
        .map(|line| {
            let trimmed = line.trim();
            let is_active = trimmed.starts_with('*');
            let name = if is_active {
                trimmed[2..].to_string()
            } else {
                trimmed.to_string()
            };
            Branch {
                id: name.clone(),
                name,
                is_active,
            }
        })
        .collect::<Vec<Branch>>();

    branches
}

#[derive(Serialize)]
struct Commit {
    id: String,
    author: String,
    date: String,
    message: String,
}

#[derive(Serialize)]
struct Change {
    filename: String,
    status: String,
    diff: String,
}

#[derive(Serialize)]
struct CommitChanges {
    id: String,
    message: String,
    author: String,
    date: String,
    changes: Vec<Change>,
}

#[tauri::command]
fn get_all_commits_from_branch(current_path: String, branch_name: String) -> Vec<Commit> {
    let output = Command::new("git")
        .arg("log")
        .arg("--pretty=format:%h|%an|%ar|%s")
        .arg(&branch_name)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let commits = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('|').collect();
            if parts.len() == 4 {
                Some(Commit {
                    id: parts[0].trim().to_string(),
                    author: parts[1].trim().to_string(),
                    date: parts[2].trim().to_string(),
                    message: parts[3].trim().to_string(),
                })
            } else {
                None
            }
        })
        .collect::<Vec<Commit>>();

    commits
}

// a function to create a new branch
#[tauri::command]
fn create_new_branch(current_path: String, branch_name: String) -> String {
    let output = Command::new("git")
        .arg("checkout")
        .arg("-b")
        .arg(&branch_name)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let message = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .to_string();

    message
}

// a function to switch to a branch
#[tauri::command]
fn switch_branch(current_path: String, branch_name: String) -> String {
    let output = Command::new("git")
        .arg("checkout")
        .arg(&branch_name)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let message = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .to_string();

    message
}

// a function to delete a branch
#[tauri::command]
fn delete_branch(current_path: String, branch_name: String) -> String {
    let output = Command::new("git")
        .arg("branch")
        .arg("-d")
        .arg(&branch_name)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let message = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .to_string();

    message
}

struct GitDiff {
    filename: String,
    status: String,
    diff: String,
}

fn get_file_diffs(commit_id: &str, current_path: &str) -> Vec<GitDiff> {
    let show_command = Command::new("git")
        .current_dir(current_path)
        .args(&["show", "--pretty=", commit_id])
        .output()
        .expect("Failed to execute git show command");

    let diff_output = from_utf8(&show_command.stdout).expect("Failed to parse git output");

    let mut diffs = Vec::new();
    let mut current_file = String::new();
    let mut current_diff = Vec::new();
    let mut reading_diff = false;

    for line in diff_output.lines() {
        if line.starts_with("diff --git") {
            // Save previous file if exists
            if !current_file.is_empty() {
                diffs.push(GitDiff {
                    filename: current_file.clone(),
                    status: "added".to_string(), // For first commit, everything is added
                    diff: current_diff.join("\n"),
                });
                current_diff.clear();
            }

            // Extract new filename
            current_file = line.split(" b/").last().unwrap_or("").to_string();
            reading_diff = true;
            current_diff.push(line);
        } else if reading_diff {
            current_diff.push(line);
        }
    }

    // Add the last file
    if !current_file.is_empty() {
        diffs.push(GitDiff {
            filename: current_file,
            status: "added".to_string(),
            diff: current_diff.join("\n"),
        });
    }

    diffs
}

// a function to get the changes in a commit with type CommitChanges
#[tauri::command]
fn get_commit_changes(current_path: String, commit_id: String) -> CommitChanges {
    // Get commit details
    let commit_info = Command::new("git")
        .current_dir(&current_path)
        .args(&["show", "--pretty=format:%H%n%s%n%an%n%aI", &commit_id])
        .output()
        .expect("Failed to execute git command");

    let commit_info_str = from_utf8(&commit_info.stdout).expect("Failed to parse commit info");
    let mut commit_info_lines = commit_info_str.lines();

    // Parse commit details
    let id = commit_info_lines.next().unwrap_or("").to_string();
    let message = commit_info_lines.next().unwrap_or("").to_string();
    let author = commit_info_lines.next().unwrap_or("").to_string();
    let date = commit_info_lines.next().unwrap_or("").to_string();

    // Get changed files
    let changes = get_file_diffs(&commit_id, &current_path)
        .into_iter()
        .map(|diff| Change {
            filename: diff.filename,
            status: diff.status,
            diff: diff.diff,
        })
        .collect();

    CommitChanges {
        id: commit_id,
        message,
        author,
        date,
        changes,
    }
}

// a function to get the current change of a file
#[tauri::command]
fn get_current_change_by_filename(current_path: String, filename: String) -> Change {
    // Get diff for the file with unified format
    let diff = Command::new("git")
        .current_dir(&current_path)
        .args(&["diff", "--unified=3", "--", &filename])
        .output()
        .expect("Failed to execute git command");

    let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

    // Extract only the actual changes (starting from @@)
    let cleaned_diff = diff_str
        .lines()
        .skip_while(|line| !line.starts_with("@@"))
        .collect::<Vec<&str>>()
        .join("\n");

    Change {
        filename,
        status: "modified".to_string(),
        diff: cleaned_diff,
    }
}

// a function to get all the current files, the status of the files without the diff
#[tauri::command]
fn get_current_changes_file_status(current_path: String) -> Vec<Change> {
    // Get changed files
    let changed_files = Command::new("git")
        .current_dir(&current_path)
        .args(&["status", "--porcelain"])
        .output()
        .expect("Failed to execute git command");

    let changed_files_str =
        from_utf8(&changed_files.stdout).expect("Failed to parse changed files");

    // Process each changed file
    let mut changes = Vec::new();
    for line in changed_files_str.lines() {
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let status = match parts[0] {
            "M" => "modified",
            "A" => "added",
            "D" => "deleted",
            "R" => "renamed",
            "??" => "untracked",
            _ => "unknown",
        };
        let filename = parts[1];

        changes.push(Change {
            filename: filename.to_string(),
            status: status.to_string(),
            diff: "".to_string(),
        });
    }

    changes
}

// a function to do exactly the same as get_current_changes but with the command git status
#[tauri::command]
fn get_current_changes_status(current_path: String) -> Vec<Change> {
    // Get changed files
    let changed_files = Command::new("git")
        .current_dir(&current_path)
        .args(&["status", "--porcelain"])
        .output()
        .expect("Failed to execute git command");

    let changed_files_str =
        from_utf8(&changed_files.stdout).expect("Failed to parse changed files");

    // Process each changed file
    let mut changes = Vec::new();
    for line in changed_files_str.lines() {
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let status = match parts[0] {
            "M" => "modified",
            "A" => "added",
            "D" => "deleted",
            "R" => "renamed",
            "??" => "untracked",
            _ => "unknown",
        };
        let filename = parts[1];

        // Get diff for the file with unified format for tracked and untracked files

        if status == "untracked" {
            let diff = Command::new("git")
                .current_dir(&current_path)
                .args(&["diff", "--unified=3", "/dev/null", filename])
                .output()
                .expect("Failed to execute git command");

            let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

            // Extract only the actual changes (starting from @@)
            let cleaned_diff = diff_str.lines().collect::<Vec<&str>>().join("\n");

            changes.push(Change {
                filename: filename.to_string(),
                status: status.to_string(),
                diff: cleaned_diff,
            });
            continue;
        } else {
            let diff = Command::new("git")
                .current_dir(&current_path)
                .args(&["diff", "--unified=3", "--", filename])
                .output()
                .expect("Failed to execute git command");

            let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

            // Extract only the actual changes (starting from @@)
            let cleaned_diff = diff_str.lines().collect::<Vec<&str>>().join("\n");

            changes.push(Change {
                filename: filename.to_string(),
                status: status.to_string(),
                diff: cleaned_diff,
            });
        }
    }

    changes
}

// a function to get all the current changes not committed
#[tauri::command]
fn get_current_changes(current_path: String) -> Vec<Change> {
    // Get changed files
    let changed_files = Command::new("git")
        .current_dir(&current_path)
        .args(&["diff", "--name-status", "--staged"])
        .output()
        .expect("Failed to execute git command");

    let changed_files_str =
        from_utf8(&changed_files.stdout).expect("Failed to parse changed files");

    // Process each changed file
    let mut changes = Vec::new();
    for line in changed_files_str.lines() {
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let status = match parts[0] {
            "M" => "modified",
            "A" => "added",
            "D" => "deleted",
            "R" => "renamed",
            _ => "unknown",
        };
        let filename = parts[1];

        // Get diff for the file with unified format
        let diff = Command::new("git")
            .current_dir(&current_path)
            .args(&["diff", "--unified=3", "--", filename])
            .output()
            .expect("Failed to execute git command");

        let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

        // Extract only the actual changes (starting from @@)
        let cleaned_diff = diff_str
            .lines()
            .skip_while(|line| !line.starts_with("@@"))
            .collect::<Vec<&str>>()
            .join("\n");

        changes.push(Change {
            filename: filename.to_string(),
            status: status.to_string(),
            diff: cleaned_diff,
        });
    }

    changes
}

// a function to get all the current changes staged
#[tauri::command]
fn get_staged_changes(current_path: String) -> Vec<Change> {
    // Get changed files
    let changed_files = Command::new("git")
        .current_dir(&current_path)
        .args(&["diff", "--name-status", "--cached"])
        .output()
        .expect("Failed to execute git command");

    let changed_files_str =
        from_utf8(&changed_files.stdout).expect("Failed to parse changed files");

    // Process each changed file
    let mut changes = Vec::new();
    for line in changed_files_str.lines() {
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let status = match parts[0] {
            "M" => "modified",
            "A" => "added",
            "D" => "deleted",
            "R" => "renamed",
            _ => "unknown",
        };
        let filename = parts[1];

        // Get diff for the file with unified format
        let diff = Command::new("git")
            .current_dir(&current_path)
            .args(&["diff", "--unified=3", "--cached", "--", filename])
            .output()
            .expect("Failed to execute git command");

        let diff_str = from_utf8(&diff.stdout).expect("Failed to parse diff");

        // Extract only the actual changes (starting from @@)
        let cleaned_diff = diff_str
            .lines()
            .skip_while(|line| !line.starts_with("@@"))
            .collect::<Vec<&str>>()
            .join("\n");

        changes.push(Change {
            filename: filename.to_string(),
            status: status.to_string(),
            diff: cleaned_diff,
        });
    }

    changes
}

// a function to stage the changes
#[tauri::command]
fn stage_changes(current_path: String, files: Vec<String>) -> String {
    let output = Command::new("git")
        .arg("add")
        .args(&files)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let message = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .to_string();

    message
}

// a function to commit the changes
#[tauri::command]
fn commit_changes(current_path: String, message: String) -> String {
    let output = Command::new("git")
        .arg("commit")
        .arg("-m")
        .arg(&message)
        .current_dir(&current_path)
        .output()
        .expect("Failed to execute git command");

    let message = from_utf8(&output.stdout)
        .expect("Failed to convert output to UTF-8")
        .to_string();

    message
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_all_git_branches,
            get_all_commits_from_branch,
            create_new_branch,
            switch_branch,
            push_current_branch,
            get_commit_changes,
            get_current_changes,
            get_staged_changes,
            get_current_change_by_filename,
            commit_changes,
            stage_changes,
            delete_branch,
            get_current_changes_status,
            get_current_changes_file_status,
            git_add_and_commit
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
