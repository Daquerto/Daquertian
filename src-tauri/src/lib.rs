use serde::Serialize;
use std::{
  collections::hash_map::DefaultHasher,
  fs,
  hash::{Hash, Hasher},
  path::{Path, PathBuf},
};

#[derive(Serialize)]
struct VaultNote {
  id: i64,
  title: String,
  content: String,
  path: String,
}

fn make_note_id(path: &Path) -> i64 {
  let mut hasher = DefaultHasher::new();
  path.to_string_lossy().hash(&mut hasher);

  (hasher.finish() & 0x7FFF_FFFF) as i64
}

fn collect_markdown_files(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), String> {
  let entries = fs::read_dir(dir).map_err(|error| error.to_string())?;

  for entry in entries {
    let entry = entry.map_err(|error| error.to_string())?;
    let path = entry.path();

    if path.is_dir() {
      collect_markdown_files(&path, files)?;
      continue;
    }

    let is_markdown = path
      .extension()
      .and_then(|extension| extension.to_str())
      .map(|extension| extension.eq_ignore_ascii_case("md"))
      .unwrap_or(false);

    if is_markdown {
      files.push(path);
    }
  }

  Ok(())
}

#[tauri::command]
fn scan_vault(vault_path: String) -> Result<Vec<VaultNote>, String> {
  let vault_dir = PathBuf::from(vault_path);

  if !vault_dir.exists() {
    return Err("Vault folder does not exist".to_string());
  }

  if !vault_dir.is_dir() {
    return Err("Selected path is not a folder".to_string());
  }

  let mut markdown_files = Vec::new();
  collect_markdown_files(&vault_dir, &mut markdown_files)?;

  let mut notes = Vec::new();

  for file_path in markdown_files {
    let content = fs::read_to_string(&file_path).map_err(|error| error.to_string())?;

    let title = file_path
      .file_stem()
      .and_then(|file_name| file_name.to_str())
      .unwrap_or("Untitled")
      .to_string();

    notes.push(VaultNote {
      id: make_note_id(&file_path),
      title,
      content,
      path: file_path.to_string_lossy().to_string(),
    });
  }

  Ok(notes)
}

#[tauri::command]
fn save_note(path: String, content: String) -> Result<(), String> {
  fs::write(path, content).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![scan_vault, save_note])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}