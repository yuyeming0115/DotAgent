// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
struct ApiProfile {
    id: String,
    name: String,
    base_url: String,
    api_key: String,
    provider: String,
    models: Vec<String>,
    is_default: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct ConfigResource {
    id: String,
    name: String,
    content: String,
    resource_type: String,
    path_globs: Vec<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Project {
    id: String,
    name: String,
    path: String,
    description: String,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Snippet {
    id: String,
    name: String,
    content: String,
    language: String,
    tags: Vec<String>,
}

#[tauri::command]
fn get_api_profiles() -> Vec<ApiProfile> {
    vec![
        ApiProfile {
            id: "1".to_string(),
            name: "官方 Anthropic".to_string(),
            base_url: "https://api.anthropic.com".to_string(),
            api_key: "sk-***".to_string(),
            provider: "anthropic".to_string(),
            models: vec!["Claude 3.7".to_string(), "Claude 3.5 Haiku".to_string(), "Claude 3 Opus".to_string()],
            is_default: true,
        },
        ApiProfile {
            id: "2".to_string(),
            name: "Proxy A".to_string(),
            base_url: "https://api-proxy.example.com/v1".to_string(),
            api_key: "sk-***".to_string(),
            provider: "proxy".to_string(),
            models: vec!["Claude 3.5".to_string(), "GPT-4o".to_string(), "Gemini 1.5".to_string()],
            is_default: false,
        },
    ]
}

#[tauri::command]
fn get_config_resources(resource_type: String) -> Vec<ConfigResource> {
    vec![
        ConfigResource {
            id: "1".to_string(),
            name: "Python 编码规范".to_string(),
            content: "# Python Coding Standards\n\n- Use type hints\n- Follow PEP8\n- Use docstrings".to_string(),
            resource_type: resource_type.clone(),
            path_globs: vec!["**/*.py".to_string()],
            created_at: "2026-06-25T10:00:00Z".to_string(),
            updated_at: "2026-06-25T10:00:00Z".to_string(),
        },
    ]
}

#[tauri::command]
fn get_projects() -> Vec<Project> {
    vec![
        Project {
            id: "1".to_string(),
            name: "DotAgent".to_string(),
            path: "D:\\GitWork\\DotAgent".to_string(),
            description: "AI agent configuration hub".to_string(),
            created_at: "2026-06-25T09:00:00Z".to_string(),
        },
    ]
}

#[tauri::command]
fn get_snippets() -> Vec<Snippet> {
    vec![
        Snippet {
            id: "1".to_string(),
            name: "Python 函数模板".to_string(),
            content: "def function_name(param: Type) -> ReturnType:\n    \"\"\"Docstring.\"\"\"\n    pass".to_string(),
            language: "python".to_string(),
            tags: vec!["python".to_string(), "function".to_string()],
        },
    ]
}

#[tauri::command]
fn save_api_profile(profile: ApiProfile) -> Result<(), String> {
    println!("Saved API profile: {:?}", profile);
    Ok(())
}

#[tauri::command]
fn save_config_resource(resource: ConfigResource) -> Result<(), String> {
    println!("Saved config resource: {:?}", resource);
    Ok(())
}

#[tauri::command]
fn add_project(path: String) -> Result<Project, String> {
    Ok(Project {
        id: "new".to_string(),
        name: path.split("\\").last().unwrap_or("Unknown").to_string(),
        path,
        description: "".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
fn test_api_connection(base_url: String, api_key: String) -> Result<HashMap<String, String>, String> {
    Ok(HashMap::from([
        ("status".to_string(), "success".to_string()),
        ("latency".to_string(), "120ms".to_string()),
        ("models".to_string(), "Claude 3.7, Claude 3.5 Haiku, Opus".to_string()),
    ]))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_api_profiles,
            get_config_resources,
            get_projects,
            get_snippets,
            save_api_profile,
            save_config_resource,
            add_project,
            test_api_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
