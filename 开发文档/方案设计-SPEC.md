# DotAgent - AI工具配置统一管理平台

## 项目概述

**DotAgent** 是一款用于统一管理 Claude Code、Trae、Cursor、Codex、GitHub Copilot、OpenCode、WorkBuddy 等 AI 编码工具配置文件的桌面应用。解决开发者需要在多个工具间重复维护相同规则、技能、工作流配置的痛点。

### 核心价值

- ✅ **一处编辑，处处生效**：统一管理所有AI工具的配置规则
- ✅ **全局+项目层叠继承**：全局配置作为基础，项目可覆盖/扩展，支持本地个人配置（不入git）
- ✅ **按路径限定的Rules**：支持按文件路径/主题加载规则，避免上下文膨胀（如只有改Python文件才加载Python规范）
- ✅ **模板片段库**：积累常用配置片段（含微信小程序/小游戏、React、Python等技术栈模板），新项目一键复用
- ✅ **可视化预览**：实时预览每个工具的导出效果
- ✅ **现有配置一键导入**：平滑迁移，无需从零开始
- ✅ **GUI + CLI 双模式**：既可以可视化编辑，也支持命令行自动化
- ✅ **API中转站统一管理**：一处配置API Key/Base URL，自动同步到所有AI工具，Key加密存储
- ✅ **技术栈自动识别**：添加项目时自动检测技术栈（含微信小程序/小游戏），推荐合适的配置模板
- ✅ **Hooks钩子图形化配置**：不用手写JSON，可视化配置自动格式化、危险操作拦截等钩子脚本
- ✅ **Skills/Commands统一管理**：斜杠命令一处定义，多工具共享可复用工作流

---

## 技术栈选型

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 桌面框架 | Tauri | 2.x | 轻量、高性能、原生体验，包体积小 |
| 后端语言 | Rust | stable | 安全、高性能，文件操作可靠 |
| 前端框架 | React | 18+ | 生态丰富，开发效率高 |
| 前端语言 | TypeScript | 5.x | 类型安全 |
| UI样式 | TailwindCSS | 3.x | 快速开发，样式统一 |
| 状态管理 | Zustand | 4.x | 轻量，简单易用 |
| 代码编辑器 | Monaco Editor | latest | VS Code同款编辑器，Markdown编辑体验好 |
| CLI框架 | clap (Rust) | 4.x | Rust生态标准CLI库 |
| 元数据存储 | SQLite | 3.x | 轻量嵌入式数据库，无需额外服务 |

---

## 核心概念模型

### 配置资源类型（ConfigResourceType）

根据对 Claude Code 官方配置体系的调研，AI工具的配置分为以下几类资源，我们分类管理：

| 类型 | 说明 | 文件格式 | 优先级 |
|------|------|---------|--------|
| **instruction** | 主指令文件（CLAUDE.md/AGENTS.md等） | Markdown | 🔴 MVP |
| **rule** | 按路径/主题限定的规则（rules/*.md），按需加载 | Markdown | 🔴 MVP |
| **setting** | 工具配置（settings.json：权限、环境变量、Hooks、模型设置） | JSON | 🟡 MVP基础，Phase2完整 |
| **hook** | 事件钩子脚本（在settings.json中配置） | Shell/Python等 | 🟡 Phase2 |
| **skill** | 可复用工作流/斜杠命令（/review-pr、/deploy等） | Markdown+资源文件 | 🟡 Phase2 |
| **agent** | 子Agent定义（专用Agent如代码审查员） | Markdown | 🟢 Phase3 |
| **mcp** | MCP服务器配置（外部工具连接） | JSON | 🟢 Phase3 |
| **api** | API接入配置（Base URL/Key/Model） | 加密存储 | 🔴 MVP |

### 1. Profile（配置包）

Profile 是配置的容器，分为两种类型：

- **Global Profile**：全局配置，所有项目默认继承
- **Project Profile**：项目级配置，可以覆盖全局配置、添加项目特有内容，支持本地个人配置（gitignore）

```typescript
interface Profile {
  id: string;                    // UUID
  name: string;                  // 显示名称
  type: 'global' | 'project';
  description?: string;
  projectPath?: string;          // 项目路径（仅Project类型）
  parentId?: string;             // 父Profile ID
  createdAt: string;
  updatedAt: string;
  enabledTools: ToolType[];      // 启用同步的工具列表
  resources: ConfigResource[];   // 所有配置资源（instruction/rule/setting/hook/skill等）
}
```

### 2. ConfigResource（配置资源基类）

所有可同步配置的统一基类：

```typescript
interface ConfigResource {
  id: string;                    // 唯一标识
  type: ConfigResourceType;      // 资源类型
  name: string;                  // 显示名称
  enabled: boolean;              // 是否启用
  priority: number;              // 排序/加载优先级
  tags: string[];                // 分类标签
  source: 'global' | 'project' | 'snippet' | 'local';
  inheritedFrom?: string;        // 继承自哪个资源ID
  tools?: ToolType[];            // 仅对指定工具生效，不填则所有工具
}
```

### 3. InstructionSection（主指令分段）

主CLAUDE.md/AGENTS.md中的分段，每次会话都加载：

```typescript
interface InstructionSection extends ConfigResource {
  type: 'instruction';
  title: string;                 // 分段标题
  content: string;               // Markdown内容
  version: number;               // 版本号，变更追踪
}
```

### 4. Rule（路径限定规则）

按文件路径glob或主题限定的规则，**只有匹配时才加载到上下文**，避免上下文窗口浪费：

```typescript
interface Rule extends ConfigResource {
  type: 'rule';
  description: string;           // 规则描述
  content: string;               // Markdown规则内容
  pathGlobs?: string[];          // 路径匹配glob，如 ["**/*.py", "src/**/*.tsx"]
  // 空表示始终加载（通用规则），有值则编辑匹配文件时才加载
  autoApply?: boolean;           // 是否自动加载（true=匹配路径自动加载，false=需要手动引用）
}
```

**Rules 应用示例**：
- `rules/python.md` + `pathGlobs: ["**/*.py"]` → 只有编辑Python文件时才加载Python规范
- `rules/testing.md` + `pathGlobs: ["**/*.test.*", "**/test/**"]` → 只在编写测试时加载测试规范
- `rules/api-design.md` + 无pathGlobs → 通用API设计规则，始终加载

### 5. ToolSettings（工具设置）

settings.json 中的配置项：

```typescript
interface ToolSettings extends ConfigResource {
  type: 'setting';
  envVars?: Record<string, string>;     // 环境变量
  defaultModel?: string;                // 默认模型
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  allowedTools?: string[];              // 允许的工具列表
  deniedTools?: string[];               // 禁止的工具列表
  cleanupPeriodDays?: number;           // 会话记录保留天数
  hooks: Hook[];                        // 关联的钩子
}
```

### 6. Hook（事件钩子）

在特定事件触发时自动执行自定义脚本：

```typescript
type HookEvent =
  | 'SessionStart'     // 会话开始
  | 'PreToolUse'       // 工具调用前（可拦截危险操作）
  | 'PostToolUse'      // 工具调用后（如自动格式化）
  | 'Stop'             // Claude停止输出时
  | 'UserPromptSubmit'; // 用户提交提示词时

interface Hook extends ConfigResource {
  type: 'hook';
  event: HookEvent;              // 触发事件
  matcher?: string;              // 匹配特定工具名（PreToolUse/PostToolUse时使用）
  command: string;               // 要执行的命令/脚本路径
  args?: string[];               // 命令参数
  timeout?: number;              // 超时时间（毫秒）
  description?: string;          // 钩子功能说明
}
```

**常用Hooks模板内置**：
- ✨ 每次文件编辑后自动运行prettier/eslint格式化
- 🛡️ 拦截危险命令（rm -rf、DROP TABLE、git push --force等）需确认
- 📝 提交前自动lint检查
- 🔔 长任务完成时系统通知

### 7. Skill（可复用斜杠命令）

Skills（Commands）是可复用的工作流，通过 `/name` 调用：

```typescript
interface Skill extends ConfigResource {
  type: 'skill';
  command: string;               // 斜杠命令名（如 'review-pr', 'deploy-staging'）
  description: string;           // 命令说明（显示在/命令列表中）
  content: string;               // SKILL.md提示词内容
  assets?: Record<string, string>; // 辅助文件（checklist.md、模板文件等，相对路径→内容）
  autoInvoke?: boolean;          // 是否自动触发（满足条件时自动调用，无需手动输入/命令）
  triggerPatterns?: string[];    // 自动触发匹配模式（正则）
}
```

### 8. Snippet（可复用片段）

片段库用于存储可复用的配置模板，可以应用到任何Profile：

```typescript
interface Snippet {
  id: string;
  name: string;
  description: string;
  resources: ConfigResource[];   // 片段包含的一组配置资源（instruction+rule+hook+skill组合）
  tags: string[];                // 技术栈标签：'python', 'react', 'miniprogram', 'minigame', 'rust', 'git'等
  author?: string;
  builtin: boolean;              // 是否内置片段
}
```

### 9. 支持的工具类型

```typescript
type ToolType =
  | 'claude-code'
  | 'trae'
  | 'cursor'
  | 'copilot'
  | 'codex'
  | 'opencode'
  | 'workbuddy';
```

### 5. API Profile（API配置方案）

用于统一管理各AI工具的API接入配置，支持官方API和中转站：

```typescript
interface ApiProfile {
  id: string;                    // UUID
  name: string;                  // 显示名称，如"官方Anthropic"、"中转站A"
  type: 'official' | 'proxy';    // 官方直连 / 中转站
  provider: 'anthropic' | 'openai' | 'custom';
  baseUrl: string;               // API Base URL
  apiKey: string;                // API Key（加密存储在系统密钥环）
  models: string[];              // 可用模型列表
  defaultModel?: string;         // 默认模型
  isDefault: boolean;            // 是否默认方案
  notes?: string;                // 备注
  createdAt: string;
  updatedAt: string;
}

// 工具API映射配置
interface ToolApiConfig {
  toolType: ToolType;
  apiProfileId: string;          // 使用哪个API Profile
  model?: string;                // 覆盖默认模型
  projectOverrides?: Record<string, { apiProfileId: string; model?: string }>;
  // 按项目路径覆盖API配置（工作项目用公司Key，个人项目用自己Key）
}
```

---

## 典型使用工作流

### 日常开发流程

```
开发者日常使用：

1. 创建/克隆项目
   · 用任意方式创建项目（git clone、手动创建等）
   · 不需要从本工具"创建项目"

2. 初始化项目配置
   · 方式一（CLI）：在项目目录下执行 dotagent init
   · 方式二（GUI）：打开 DotAgent → 添加项目 → 选择文件夹
   · 自动执行：
     ├─ 扫描项目目录，检测已有的 CLAUDE.md / AGENTS.md 等配置
     ├─ 识别项目技术栈（通过 package.json / Cargo.toml / pyproject.toml 等）
     ├─ 根据技术栈推荐合适的片段模板
     └─ 导入现有配置

3. 调整项目配置
   · 在GUI中查看继承自全局的所有规则
   · 按需覆盖某些分段（如项目特定的编码规范）
   · 按需禁用某些不适用于本项目的分段
   · 添加项目专有规则（如项目架构说明、特定约定）
   · 选择本项目要同步到哪些工具

4. 同步配置
   · 点击「同步」按钮或执行 dotagent sync
   · 自动在项目根目录生成：
     ├─ CLAUDE.md        (Claude Code)
     ├─ AGENTS.md        (Trae)
     ├─ CODEX.md         (Codex)
     └─ WORKBUDDY.md     (WorkBuddy)

5. 开始开发，想用哪个工具用哪个
   · 用 Trae 打开项目 → 自动读取 AGENTS.md
   · 用 Claude Code (CLI) 打开项目 → 自动读取 CLAUDE.md
   · 用 Codex 打开项目 → 自动读取 CODEX.md
   · 用 WorkBuddy 打开项目 → 自动读取 WORKBUDDY.md
   · 所有工具看到的是同一份规则！

6. 持续迭代
   · 积累了更好的编码经验？→ 修改全局配置 → 一键同步，所有项目受益
   · 某个项目需要特殊规则？→ 修改项目配置 → 一键同步
```

### 全局配置 vs 项目配置 写入位置

| 配置层级 | 写入位置 | 作用范围 |
|---------|---------|---------|
| **全局指令配置** | `~/.claude/CLAUDE.md`, `~/.codex/CODEX.md`, `~/.workbuddy/WORKBUDDY.md` | 所有项目默认生效 |
| **全局API配置** | 各工具的全局配置文件/环境变量 | 所有项目默认生效 |
| **项目指令配置** | `{项目}/CLAUDE.md`, `{项目}/AGENTS.md`, `{项目}/CODEX.md`, `{项目}/WORKBUDDY.md` | 仅该项目生效，可覆盖全局规则 |
| **项目API配置** | 项目级配置或覆盖全局环境变量 | 仅该项目生效 |

---

## API中转站统一管理模块

### 功能概述

统一管理各AI工具的API接入配置，包括官方API和第三方中转站（one-api、new-api等），一处配置，自动同步到所有支持的AI工具。

### 数据模型

详见上文「5. API Profile（API配置方案）」。

### 支持的API配置写入方式

根据各工具的配置方式不同，分级处理：

| 工具 | 配置方式 | 自动配置支持 |
|------|---------|-------------|
| **Claude Code** | 环境变量 `ANTHROPIC_BASE_URL` / `ANTHROPIC_API_KEY`；或 `~/.claude/settings.json` | ✅ 自动写入配置文件 |
| **Codex (OpenAI)** | 环境变量 `OPENAI_BASE_URL` / `OPENAI_API_KEY`；或配置文件 | ✅ 自动写入配置文件 |
| **WorkBuddy** | 配置文件存储API设置 | ✅ 自动写入配置文件 |
| **Trae** | 图形界面设置，查找配置文件位置 | ⚠️ 优先自动写入配置文件；如无法定位：<br>1. 打开Trae设置页<br>2. 自动复制Key到剪贴板<br>3. 引导用户粘贴 |

### API Profile管理界面

```
┌─────────────────────────────────────────────────────────────────┐
│  🔑 API 配置中心                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API 方案列表                                            │   │
│  │                                                         │   │
│  │  ● 官方 Anthropic          [编辑] [删除]                │   │
│  │    Base URL: https://api.anthropic.com                  │   │
│  │    默认模型: Claude 3.7 Sonnet                          │   │
│  │                                                         │   │
│  │  ● 官方 OpenAI             [编辑] [删除]                │   │
│  │    Base URL: https://api.openai.com                     │   │
│  │    默认模型: GPT-4o                                     │   │
│  │                                                         │   │
│  │  ● 中转站 A (高速)         [编辑] [删除] [设为默认]     │   │
│  │    Base URL: https://api.example.com                    │   │
│  │    可用模型: Claude 3.7, GPT-4o, DeepSeek-V3, o3-mini   │   │
│  │                                                         │   │
│  │  [+ 添加新API方案]  [ 测试连接 ]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  工具-API映射                                            │   │
│  │                                                         │   │
│  │  Claude Code  → [中转站 A        ▼]  模型: [Claude 3.7] │   │
│  │  Trae         → [官方 Anthropic  ▼]  模型: [默认]       │   │
│  │  Codex        → [中转站 A        ▼]  模型: [GPT-4o]     │   │
│  │  WorkBuddy    → [中转站 A        ▼]  模型: [默认]       │   │
│  │                                                         │   │
│  │  [x] 允许项目覆盖API配置                                │   │
│  │                                                         │   │
│  │  [一键应用配置到所有工具]                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  配置状态                                                │   │
│  │  ✅ Claude Code: API配置已写入                           │   │
│  │  ✅ Codex: API配置已写入                                 │   │
│  │  ✅ WorkBuddy: API配置已写入                             │   │
│  │  ⚠️ Trae: 请打开设置页，已复制API Key到剪贴板            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### API Profile编辑表单字段

| 字段 | 说明 |
|------|------|
| 方案名称 | 自定义显示名称，如"我的中转站" |
| 类型 | 官方直连 / 中转站 |
| 服务商 | Anthropic / OpenAI / 自定义（OpenAI兼容格式） |
| Base URL | API端点地址 |
| API Key | 密钥（加密存储，不显示明文） |
| 模型列表 | 支持的模型（可自动获取或手动添加） |
| 默认模型 | 默认使用的模型 |
| 设为默认 | 是否作为新工具的默认方案 |

### 安全机制

1. **密钥安全存储**：API Key 使用系统密钥环存储（Windows Credential Manager / macOS Keychain / Linux Secret Service），不明文存储在配置文件中
2. **导出加密**：API配置导出备份时使用密码加密
3. **脱敏显示**：界面上API Key只显示前后几位，中间用`***`代替
4. **连通性测试**：配置后可以一键测试API是否正常工作，验证Key有效性

### Coding Plan/订阅方案说明

- 不介入订阅/计费管理，订阅本身在平台侧处理
- 内置常见模型列表，用户也可自定义添加模型名
- 如果某个模型需要特定订阅，界面上给予提示（如"Claude 3.7 Opus 需要 Claude Max 订阅"）
- Phase 2可选：如果中转站提供用量查询API，可展示Token用量统计

---

## 层叠继承机制

### 合并算法

```
EffectiveConfig = Merge(GlobalProfile, ProjectProfile, TargetTool)
```

**合并步骤**：

1. **收集全局Sections**：从GlobalProfile中获取所有 `enabled=true` 的Sections
2. **应用项目覆盖**：遍历ProjectProfile的Sections：
   - 相同 `id` 匹配 → 用项目Section覆盖全局Section
   - 新增 `id` → 添加为项目特有Section
   - 标记 `_disabled` → 从集合中移除对应全局Section
3. **优先级排序**：按 `priority` 升序排列所有Sections
4. **工具过滤**：根据目标工具类型过滤：
   - `scope='universal'` → 保留
   - `scope='tool-specific'` 且 `tools` 包含目标工具 → 保留
   - 其他 → 过滤掉
5. **渲染输出**：按工具适配器要求的格式拼接内容

### 特殊控制指令

在项目配置中可通过HTML注释控制继承行为：

```markdown
<!-- dotagent: disable-section=coding-style -->
禁用id为"coding-style"的全局section

<!-- dotagent: prepend-section=persona -->
在persona section之前插入内容（高级用法）
```

### GUI中的继承可视化

项目配置页面清晰展示：
- 🟢 **继承自全局**：灰色标记，显示"来自全局配置"，点击可"覆盖编辑"
- 🚫 **已禁用全局项**：删除线样式，可一键重新启用
- 🔵 **项目自定义**：正常显示，标记为"项目特有"
- 🔀 **覆盖项**：高亮显示，标注"已覆盖全局配置"，可"还原为全局版本"

---

## 适配器系统设计

### Adapter Trait（Rust）

```rust
use async_trait::async_trait;
use std::path::{Path, PathBuf};

#[async_trait]
pub trait ToolAdapter: Send + Sync {
    /// 工具类型标识
    fn tool_type(&self) -> ToolType;

    /// 工具显示名称
    fn display_name(&self) -> &str;

    /// 工具图标（用于UI显示）
    fn icon(&self) -> &str;

    /// ========== 指令配置相关 ==========

    /// 获取全局指令配置文件路径列表
    fn global_config_paths(&self) -> Vec<PathBuf>;

    /// 获取项目指令配置文件路径列表
    fn project_config_paths(&self, project_root: &Path) -> Vec<PathBuf>;

    /// 检测该工具是否在系统中可用
    fn is_available(&self) -> bool;

    /// 读取现有配置文件，解析为Section列表（用于导入）
    fn read_existing(&self, path: &Path) -> Result<Vec<Section>, AdapterError>;

    /// 将合并后的配置渲染为该工具的最终格式
    fn render(
        &self,
        sections: &[Section],
        target: ConfigTarget,
    ) -> Result<String, AdapterError>;

    /// 写入指令配置到目标位置
    fn write_config(&self, content: &str, target: ConfigTarget) -> Result<(), AdapterError>;

    /// 头部注释模板（每个工具可以有不同的头部）
    fn header_template(&self, target: ConfigTarget) -> Option<String> { None }

    /// 注释风格
    fn comment_style(&self) -> CommentStyle { CommentStyle::Markdown }

    /// 工具特定的包装/转换逻辑
    fn transform_section(&self, section: &Section) -> String {
        section.content.clone()
    }

    /// ========== API配置相关 ==========

    /// 该工具是否支持API配置写入
    fn supports_api_config(&self) -> bool { false }

    /// 获取API配置文件路径（全局）
    fn api_config_paths(&self) -> Vec<PathBuf> { vec![] }

    /// 写入API配置（Base URL + API Key + Model）
    fn write_api_config(
        &self,
        base_url: &str,
        api_key: &str,
        model: Option<&str>,
    ) -> Result<ApiWriteResult, AdapterError> {
        Err(AdapterError::Unsupported("API config not supported for this tool".into()))
    }

    /// 检测API配置方式
    fn api_config_method(&self) -> ApiConfigMethod { ApiConfigMethod::Manual }
}

pub enum ConfigTarget {
    Global,
    Project { root: PathBuf },
}

pub enum CommentStyle {
    Markdown,   // <!-- ... --> HTML注释 + Markdown
    Slash,      // // ... C风格单行注释
    Hash,       // # ... Shell风格注释
}

pub enum ApiConfigMethod {
    AutoWrite,       // 可以自动写入配置文件
    EnvVar,          // 通过环境变量配置
    CopyToClipboard, // 复制到剪贴板，需用户手动粘贴
    Manual,          // 需要用户手动配置
}

pub struct ApiWriteResult {
    pub success: bool,
    pub message: String,
    pub copied_to_clipboard: bool,
}

#[derive(Debug)]
pub enum AdapterError {
    Io(std::io::Error),
    Parse(String),
    Unsupported(String),
}
```

### 各工具配置映射表

| 工具 | 全局指令 | 项目指令 | Rules | Settings/Hooks | Skills/Commands | 子Agents | MCP |
|------|---------|---------|-------|---------------|----------------|---------|-----|
| **Claude Code** | `~/.claude/CLAUDE.md` | `{project}/CLAUDE.md` | `~/.claude/rules/*.md`<br>`{project}/.claude/rules/*.md` | `~/.claude/settings.json`<br>`{project}/.claude/settings.json` | `~/.claude/skills/<name>/SKILL.md`<br>`{project}/.claude/skills/<name>/SKILL.md`<br>`~/.claude/commands/*.md`<br>`{project}/.claude/commands/*.md` | `~/.claude/agents/*.md`<br>`{project}/.claude/agents/*.md` | `~/.claude/.mcp.json`<br>`{project}/.mcp.json` |
| **Trae** | `~/.trae/AGENTS_GLOBAL.md` | `{project}/AGENTS.md` | （预留适配） | （预留适配） | （预留适配） | （预留） | （预留） |
| **Codex** | `~/.codex/CODEX.md` | `{project}/AGENTS.md` (开放标准) | （适配中） | （适配中） | （支持skills） | （适配中） | （适配中） |
| **WorkBuddy** | `~/.workbuddy/WORKBUDDY.md` | `{project}/WORKBUDDY.md` | （预留适配） | （预留适配） | （预留适配） | （预留） | （预留） |
| **Cursor** | (UI导入) | `{project}/.cursorrules` | Phase 2 | Phase 2 | Phase 2 | Phase 3 | Phase 3 |
| **GitHub Copilot** | - | `{project}/.github/copilot-instructions.md` | Phase 2 | Phase 2 | Phase 2 | Phase 3 | Phase 3 |
| **OpenCode** | `~/.opencode/OPENCODE.md` | `{project}/OPENCODE.md` | Phase 2 | Phase 2 | Phase 2 | Phase 3 | Phase 3 |

> **AGENTS.md 开放标准说明**：AGENTS.md 是 OpenAI、Google、Cognition、Cursor 等厂商联合推出的开放标准，被 Codex、Devin、GitHub Copilot、Gemini CLI、Cursor、Amp 等越来越多工具支持。我们同步生成根目录 AGENTS.md 可以让更多工具自动识别配置。

### Claude Code 完整配置目录结构

```
~/.claude/                           # 全局配置目录
├── CLAUDE.md                        # 全局主指令
├── rules/                           # 全局按路径规则
│   ├── general.md                   # 通用规则（始终加载）
│   ├── python.md                    # Python规则（**/*.py时加载）
│   └── testing.md                   # 测试规则（**/*.test.*时加载）
├── settings.json                    # 全局设置（权限、环境变量、Hooks）
├── skills/                          # 全局Skills（可复用工作流）
│   └── review-pr/
│       ├── SKILL.md                 # 技能主文件
│       └── checklist.md             # 辅助资源
├── commands/                        # 全局Commands（单文件斜杠命令）
│   └── deploy.md
├── agents/                          # 全局子Agent定义
│   └── code-reviewer.md
└── .mcp.json                        # 全局MCP服务器配置

{project}/.claude/                   # 项目级配置目录
├── CLAUDE.md                        # 项目主指令
├── CLAUDE.local.md                  # 个人本地配置（gitignore）
├── rules/                           # 项目规则（追加/覆盖全局规则）
├── settings.json                    # 项目设置（覆盖全局）
├── settings.local.json              # 个人本地设置（gitignore）
├── skills/                          # 项目Skills
├── commands/                        # 项目Commands
└── agents/                          # 项目子Agents

{project}/AGENTS.md                  # AGENTS.md开放标准（根目录，多工具识别）
{project}/.mcp.json                  # 项目级MCP配置
```

### 适配器实现要点

1. **Claude Code 适配器**（MVP核心）：
   - **Instructions**：支持全局+项目+本地三层指令配置，头部添加 `<!-- Generated by DotAgent -->` 标记，识别现有CLAUDE.md自动分段
   - **Rules**：将pathGlobs映射到rules目录，文件名使用slug，自动生成frontmatter描述
   - **Settings**：MVP支持环境变量、默认模型、权限模式；Phase2完整支持Hooks可视化配置
   - **API配置**：自动写入`~/.claude/settings.json`或环境变量，Key加密存储在系统密钥环
   - **Skills/Commands**：Phase2支持，将command+content映射到skills/<name>/SKILL.md 或 commands/*.md
   - **Hooks**：Phase2支持图形化配置，内置常用Hook模板（自动格式化、危险拦截等）
   - **Agents/MCP**：Phase3支持

2. **Trae 适配器**：
   - 输出到 `AGENTS.md`（开放标准格式）
   - 遵循Trae的always_applied_workspace_rules格式
   - 尝试定位Trae配置文件写入API，失败则复制Key到剪贴板并引导用户

3. **Codex 适配器**：
   - 输出到根目录 `AGENTS.md`（开放标准，多工具共享）
   - 支持API配置通过环境变量 `OPENAI_BASE_URL` / `OPENAI_API_KEY` 写入
   - 适配Codex的Skills格式

4. **WorkBuddy 适配器**：
   - 输出到 `WORKBUDDY.md`
   - 支持API配置写入配置文件

5. **Cursor 适配器（Phase 2）**：
   - `.cursorrules` 纯文本格式转换，用注释分隔段落
   - 支持导入现有 `.cursorrules`

### 本地个人配置（gitignore 规则）

项目级配置中，`*.local.md` 和 `settings.local.json` 设计为**个人本地配置**，写入 `.gitignore` 不提交到版本库：
- 不同开发者可以有自己的偏好设置（如喜欢的代码风格、个人通知钩子）
- 团队共享配置和个人配置分离，不互相干扰
- `dotagent init` 时自动添加到 `.gitignore`

---

## 同步引擎设计

### 同步模式

- **手动同步**：用户点击"同步"按钮或执行 `dotagent sync` 命令
- **自动同步（可选）**：监听配置文件变更，自动触发同步（可在设置中开关）
- **项目切换同步**：检测到打开项目时自动应用项目配置

### 同步工作流

```
用户触发同步
    │
    ├─→ 验证Profile完整性
    │
    ├─→ 对每个启用的工具：
    │     │
    │     ├─→ 合并Global + Project配置
    │     ├─→ 过滤该工具的Sections
    │     ├─→ 调用Adapter.render()生成内容
    │     ├─→ 备份现有配置文件（可选）
    │     └─→ 调用Adapter.write()写入目标位置
    │
    └─→ 生成同步报告：
          - ✅ 成功列表
          - ⚠️ 警告列表（如工具未安装）
          - ❌ 失败列表及原因
          - 📊 变更统计（新增/修改/删除的Section数）
```

### 安全机制

1. **备份**：写入前自动备份原文件到 `.dotagent/backups/`，保留最近10个版本
2. **Dry Run**：支持预览模式，只显示将要写入的内容，不实际修改文件
3. **头部标记**：写入的文件开头添加标记，防止覆盖用户手动修改的内容（检测到无标记时提示确认）

---

## 应用功能模块

### GUI 主要界面

#### 1. Dashboard（仪表盘）
- 全局配置状态概览
- API配置状态（各工具API是否已配置）
- 最近项目列表
- 同步状态（各工具最后同步时间）
- 快速操作按钮（初始化项目、同步所有、打开API配置）

#### 2. 全局配置编辑器
- Section列表管理（左侧）
- Markdown编辑器（中央，Monaco Editor）
- 实时预览面板（右侧，可切换不同工具预览）
- Section属性编辑（作用域、标签、优先级、启用开关）

#### 3. 项目配置编辑器
- 项目路径选择
- 项目技术栈自动识别与显示
- 继承关系可视化（全局Sections列表，可覆盖/禁用）
- 项目特有Sections编辑
- 项目启用的工具选择
- 项目级API配置覆盖（可选）
- "从全局覆盖"、"还原全局"、"禁用"操作按钮

#### 4. API配置中心 🔑
- API Profile管理（添加/编辑/删除多个API方案）
  - 官方Anthropic、官方OpenAI预设
  - 自定义中转站（one-api/new-api等OpenAI兼容格式）
- API连通性测试按钮
- 工具-API映射配置（为每个工具选择使用哪个API方案和模型）
- API Key脱敏显示
- 配置状态检测与应用
- 项目级API覆盖开关（不同项目用不同Key）

#### 5. 片段库管理
- 内置片段浏览
- 用户自定义片段CRUD
- 片段标签分类
- 一键应用到当前Profile

#### 6. 同步中心
- 工具启用/禁用开关（包含指令配置和API配置两个维度）
- 各工具配置路径显示
- 同步按钮（指令同步 + API同步）
- Diff对比（当前文件 vs 将生成的文件）
- 同步历史记录

#### 7. 项目初始化向导
- 选择项目文件夹
- 自动扫描现有配置文件并预览
- 自动识别项目技术栈
- 推荐适用的片段模板
- 确认导入/初始化

#### 8. 设置页面
- 应用主题（深色/浅色，默认深色）
- 自动同步开关
- 备份设置
- 数据目录位置
- 系统集成选项（右键菜单、环境变量等）

### CLI 命令

```bash
# 初始化 - 在当前目录初始化项目配置，检测并导入现有配置
dotagent init [--path <project-path>] [--import-all]

# 状态 - 查看当前目录的配置状态
dotagent status [--path <path>]

# 同步 - 同步配置到目标工具（指令配置 + API配置）
dotagent sync [--path <project-path>]
               [--global]              # 仅同步全局配置
               [--tool <tool-name>]    # 指定同步单个工具
               [--config-only]         # 仅同步指令配置
               [--api-only]            # 仅同步API配置
               [--dry-run]             # 预览模式，不写入
               [--force]               # 强制覆盖，跳过确认

# API管理
dotagent api list                      # 列出所有API配置
dotagent api add                       # 交互式添加API配置
dotagent api test <profile-name>       # 测试API连通性
dotagent api apply                     # 应用API配置到所有工具
dotagent api set-default <profile-name># 设置默认API方案

# Profile管理
dotagent profile list
dotagent profile edit <global|project>  # 打开GUI编辑器

# 项目管理
dotagent project list
dotagent project create <path> [--from <template>]
dotagent project link <path>   # 将现有目录链接为项目
dotagent project detect <path> # 检测项目技术栈并推荐模板

# 片段管理
dotagent snippet list
dotagent snippet apply <snippet-name> [--to global|project]
dotagent snippet create
dotagent snippet delete <name>

# Hooks管理（Phase2）
dotagent hook list                       # 列出已配置Hooks
dotagent hook add --event <event> --cmd <command> [--matcher <tool>]
dotagent hook enable <id>
dotagent hook disable <id>
dotagent hook template list              # 列出内置Hook模板
dotagent hook apply-template <name>      # 应用内置Hook模板

# Skills管理（Phase2）
dotagent skill list
dotagent skill create <command-name>
dotagent skill delete <name>

# Rules管理
dotagent rule list
dotagent rule add --globs "<pattern>" --file <file>

# 预览
dotagent preview --tool <tool-name> [--global|--project]
dotagent diff --tool <tool-name> [--path <path>]

# 导入
dotagent import --tool <tool-name> --from <file-path> [--to global|project]
dotagent import-all  # 自动检测所有工具配置并导入

# GUI
dotagent gui [--page <page-name>]

# 版本/帮助
dotagent --version
dotagent --help
```

---

## 目录结构设计

### 应用数据目录（`~/.dotagent/`）

```
~/.dotagent/
├── config.toml                   # 应用配置
├── db.sqlite                     # 元数据数据库（所有Profile/Resource/Snippet/Hook/Skill都存在这里）
├── backups/                      # 配置文件备份
│   ├── config/{tool}/{timestamp}.{ext}
│   └── api/{tool}/{timestamp}.json
├── assets/                       # Skill辅助资源文件（checklist、模板等）
│   └── skill-{id}/
├── api/                          # API配置（Key存在系统密钥环，这里仅存元数据引用）
│   └── profiles.json
├── builtin-snippets/             # 内置片段（随应用发布）
│   ├── general/
│   │   ├── clean-code.md
│   │   ├── git-commit.md
│   │   └── security-audit.md
│   ├── tech-stacks/
│   │   ├── react.md
│   │   ├── python.md
│   │   ├── rust.md
│   │   ├── miniprogram.md        # 微信小程序规范
│   │   └── minigame.md           # 微信小游戏规范
│   └── hooks/
│       ├── auto-format.json      # 自动格式化Hook模板
│       ├── danger-block.json     # 危险操作拦截Hook模板
│       └── notify-complete.json  # 任务完成通知Hook模板
└── projects/                     # 项目索引
    └── {hash-of-project-path}.json
```

### 项目本地目录（`{project}/.dotagent/`）

```
{project}/.dotagent/
├── project.json                  # 项目Profile元数据
├── api-overrides.json            # 项目级API覆盖配置（可选）
└── backups/                      # 该项目的配置备份
```

### 源代码目录结构

```
agent-config-hub/
├── src-tauri/                    # Rust后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── cli.rs                # CLI入口
│   │   ├── config/
│   │   │   ├── mod.rs
│   │   │   ├── models.rs         # 数据结构定义（Profile/ConfigResource/Rule/Hook/Skill/ApiProfile）
│   │   │   ├── merge.rs          # 层叠合并逻辑（global→project→local）
│   │   │   └── validate.rs       # 配置验证
│   │   ├── storage/
│   │   │   ├── mod.rs
│   │   │   ├── db.rs             # SQLite操作
│   │   │   ├── profile.rs        # Profile CRUD
│   │   │   ├── resource.rs       # ConfigResource CRUD（instruction/rule/setting/hook/skill统一管理）
│   │   │   ├── snippet.rs        # 片段库管理
│   │   │   └── keyring.rs        # 系统密钥环封装（安全存储API Key）
│   │   ├── api/                  # API配置管理模块
│   │   │   ├── mod.rs
│   │   │   ├── profiles.rs       # API Profile CRUD
│   │   │   ├── test_connect.rs   # API连通性测试
│   │   │   └── apply.rs          # 应用API配置到各工具
│   │   ├── detector/             # 项目检测模块
│   │   │   ├── mod.rs
│   │   │   ├── tech_stack.rs     # 技术栈识别（含微信小程序/小游戏检测：project.config.json/game.json）
│   │   │   └── existing_config.rs # 检测现有配置文件并解析导入
│   │   ├── adapter/
│   │   │   ├── mod.rs
│   │   │   ├── trait.rs          # Adapter trait（完整支持所有资源类型）
│   │   │   ├── registry.rs       # 适配器注册表
│   │   │   ├── claude_code.rs    # Claude Code适配器（MVP核心）
│   │   │   ├── trae.rs           # Trae适配器
│   │   │   ├── codex.rs          # Codex适配器
│   │   │   └── workbuddy.rs      # WorkBuddy适配器
│   │   ├── sync/
│   │   │   ├── mod.rs
│   │   │   ├── engine.rs         # 同步引擎（所有配置资源同步）
│   │   │   ├── backup.rs         # 备份管理
│   │   │   └── watcher.rs        # 文件监听（可选）
│   │   ├── commands/             # Tauri IPC命令
│   │   │   ├── mod.rs
│   │   │   ├── profile_cmd.rs
│   │   │   ├── resource_cmd.rs   # 统一资源管理命令
│   │   │   ├── snippet_cmd.rs
│   │   │   ├── api_cmd.rs        # API配置相关命令
│   │   │   ├── hook_cmd.rs       # Hooks管理命令（Phase2）
│   │   │   ├── skill_cmd.rs      # Skills管理命令（Phase2）
│   │   │   ├── sync_cmd.rs
│   │   │   └── import_cmd.rs     # 现有配置导入（含rules/settings/hooks解析）
│   │   ├── importer/             # 导入解析器
│   │   │   ├── mod.rs
│   │   │   ├── markdown.rs       # Markdown分段解析
│   │   │   ├── settings.rs       # settings.json解析导入
│   │   │   └── rules.rs          # rules目录扫描导入
│   │   └── utils/
│   │       ├── paths.rs
│   │       └── fs.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── src/                          # React前端
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── profile/
│   │   │   ├── GlobalProfilePage.tsx
│   │   │   ├── ProjectProfilePage.tsx
│   │   │   ├── ResourceList.tsx       # 统一资源列表（分类Tab: 主指令/Rules/Settings/Hooks/Skills）
│   │   │   ├── InstructionEditor.tsx  # 主指令分段编辑器
│   │   │   ├── RuleEditor.tsx         # Rule编辑器（含pathGlobs路径配置）
│   │   │   ├── SettingsEditor.tsx     # 工具设置编辑器（环境变量、权限、默认模型）
│   │   │   ├── HookEditor.tsx         # Hooks可视化编辑器（Phase2）
│   │   │   ├── SkillEditor.tsx        # Skills编辑器（Phase2）
│   │   │   ├── InheritanceView.tsx    # 继承关系可视化
│   │   │   └── ResourceProperties.tsx # 属性面板
│   │   ├── api/                  # API配置中心页面
│   │   │   ├── ApiConfigPage.tsx
│   │   │   ├── ApiProfileList.tsx
│   │   │   ├── ApiProfileForm.tsx
│   │   │   ├── ToolApiMapping.tsx
│   │   │   └── TestConnectionButton.tsx
│   │   ├── project-wizard/       # 项目初始化向导
│   │   │   └── InitWizard.tsx
│   │   ├── snippet/
│   │   │   ├── SnippetLibrary.tsx
│   │   │   └── SnippetEditor.tsx
│   │   ├── hooks/                # Hooks管理页面（Phase2）
│   │   │   ├── HookLibrary.tsx
│   │   │   └── HookTemplateCard.tsx  # 内置Hook模板卡片
│   │   ├── skills/               # Skills管理页面（Phase2）
│   │   │   ├── SkillLibrary.tsx
│   │   │   └── SkillEditor.tsx
│   │   ├── sync/
│   │   │   ├── SyncCenter.tsx
│   │   │   ├── ToolCard.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   └── SyncHistory.tsx
│   │   ├── import/
│   │   │   └── ImportWizard.tsx
│   │   ├── preview/
│   │   │   └── ToolPreview.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── common/
│   │       ├── MarkdownEditor.tsx
│   │       ├── ToolIcon.tsx
│   │       ├── TagInput.tsx
│   │       ├── PathGlobInput.tsx     # 路径glob输入组件
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useResources.ts           # 统一资源管理hook
│   │   └── useSync.ts
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── profileStore.ts
│   │   └── syncStore.ts
│   ├── types/
│   │   └── index.ts              # 与Rust对应的TS类型
│   ├── utils/
│   │   ├── invoke.ts             # Tauri invoke封装
│   │   └── format.ts
│   └── styles/
│       └── globals.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## UI设计规范

### 配色方案（深色主题，默认）

| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景 | `#1A1D21` | 主背景色 |
| 侧边栏 | `#16191C` | 侧边栏/面板背景 |
| 卡片 | `#22262B` | 卡片/编辑器背景 |
| 边框 | `#2F353D` | 边框/分割线 |
| 主色调 | `#6366F1` | Indigo主色（区别于MMY的金色） |
| 成功 | `#22C55E` | 成功状态 |
| 警告 | `#F59E0B` | 警告状态 |
| 错误 | `#EF4444` | 错误状态 |
| 文字主色 | `#E5E7EB` | 主要文字 |
| 文字次色 | `#9CA3AF` | 次要文字 |
| 文字 muted | `#6B7280` | 弱化文字 |

### 界面布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo  DotAgent                    [─] [□] [×]  _  Header  │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ 📊 Dashboard          ┌──────────────────────────────────────────┐ │
│ 🌍 Global             │                                          │ │
│ 📁 Projects           │          Section Editor                  │ │
│ 🔑 API Keys           │          (Monaco Editor)                 │ │
│ 📦 Snippets           │                                          │ │
│ 🔄 Sync Center        └──────────────────────────────────────────┘ │
│ ⚙️ Settings           ┌──────────────────────────────────────────┐ │
│          │           │                   Preview Pane            │   │
│ Sidebar  │        [Claude] [Trae] [Codex] [WorkBuddy]  Tabs      │   │
│          │                                                      │   │
│          │     Preview rendered output for selected tool        │   │
│          └──────────────────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## 开发计划与里程碑

### Phase 1: MVP核心功能
- [ ] 项目初始化（Tauri + React + TS工程搭建）
- [ ] 核心数据模型定义（Rust + TS类型，含ConfigResource/Rule/ApiProfile）
- [ ] 系统密钥环集成（安全存储API Key）
- [ ] 统一资源管理CRUD（Instruction/Rule/Setting基础配置）
- [ ] 层叠合并引擎实现（global→project→local三层继承）
- [ ] Claude Code适配器（完整支持Instructions/Rules/Settings基础）
  - [ ] CLAUDE.md生成与同步
  - [ ] rules/目录生成与pathGlobs映射
  - [ ] settings.json基础配置（环境变量、默认模型、权限）
  - [ ] API配置自动写入
- [ ] Codex适配器 + Trae适配器 + WorkBuddy适配器（指令+API配置）
- [ ] API配置管理模块：
  - [ ] API Profile CRUD
  - [ ] 四个工具的API配置写入
  - [ ] API连通性测试
- [ ] 项目检测模块（技术栈识别、现有配置检测，含微信小程序/小游戏检测）
- [ ] 现有配置导入：
  - [ ] CLAUDE.md分段解析
  - [ ] rules/目录扫描导入
  - [ ] settings.json解析
- [ ] 基础GUI：
  - [ ] 全局配置编辑器（主指令分段编辑）
  - [ ] Rules编辑器（含pathGlobs路径配置）
  - [ ] 基础Settings编辑（环境变量、默认模型）
  - [ ] API配置中心
- [ ] 基础CLI：init/status/sync/api/rule/preview命令
- [ ] 手动同步功能（所有资源类型同步）

### Phase 2: Hooks + Skills 效率增强
- [ ] Hooks图形化配置界面
  - [ ] 事件选择（SessionStart/PreToolUse/PostToolUse/Stop等）
  - [ ] 命令/脚本配置
  - [ ] 内置Hook模板库（自动格式化、危险拦截、通知等）
- [ ] Skills/Commands统一管理
  - [ ] SKILL.md编辑器
  - [ ] 辅助资源文件管理
  - [ ] 斜杠命令列表预览
- [ ] Settings完整功能（权限模式精细化配置）
- [ ] 项目配置编辑器 + 继承可视化
- [ ] 项目初始化向导GUI
- [ ] 项目级API覆盖功能
- [ ] Cursor/Copilot/OpenCode适配器（指令+Rules+API）
- [ ] 片段库完整功能（含微信小程序/小游戏技术栈内置模板）
- [ ] 本地个人配置支持（*.local.md + settings.local.json自动gitignore）
- [ ] Diff预览
- [ ] 备份/还原功能
- [ ] 导入向导完整版本
- [ ] 同步中心界面
- [ ] 仪表盘页面
- [ ] CLI扩展：hook/skill命令

### Phase 3: 高级功能
- [ ] SubAgents子Agent管理
- [ ] MCP服务器统一配置
- [ ] 自动同步（文件监听）
- [ ] 配置版本历史与对比
- [ ] 主题切换
- [ ] 系统托盘集成
- [ ] Windows右键菜单集成
- [ ] Output styles自定义输出格式
- [ ] API用量统计（若中转站支持）

### Phase 4: 生态扩展
- [ ] 配置加密导出/导入
- [ ] 社区片段市场（预留）
- [ ] 多语言支持
- [ ] 团队配置共享（预留）
- [ ] 云同步（预留）

---

## 数据流架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  UI State   │  │   Editor    │  │     Preview Render      │  │
│  │ (Zustand)   │  │ (Monaco)    │  │ (调用Rust合并+渲染)     │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          │ Tauri IPC (invoke)                   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    Backend (Rust)                               │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Command Layer                         │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                 │
│  ┌──────▼──────┐   ┌───────▼───────┐   ┌──────▼──────┐         │
│  │  Profile    │   │ Merge Engine  │   │  Sync Engine│         │
│  │  Service    │   │               │   │             │         │
│  └──────┬──────┘   └───────┬───────┘   └──────┬──────┘         │
│         │                  │                  │                 │
│  ┌──────▼──────┐   ┌───────▼───────┐   ┌──────▼──────┐         │
│  │  Storage    │   │   Adapter     │   │ API Manager │         │
│  │ (SQLite+FS) │   │   Registry    │   │+Keyring+Test│         │
│  └─────────────┘   └───────┬───────┘   └─────────────┘         │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                 │
│  ┌──────▼──────┐   ┌───────▼───────┐   ┌──────▼──────┐         │
│  │ ClaudeCode  │   │     Trae      │   │    Codex    │  ...   │
│  │  Adapter    │   │   Adapter     │   │   Adapter   │         │
│  │ (config+API)│   │ (config+API)  │   │ (config+API)│         │
│  └─────────────┘   └───────────────┘   └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
写入 ~/.claude/CLAUDE.md          写入API配置
     AGENTS.md等                  (settings/env/剪贴板)
```

---

## 核心优势总结

| 对比项 | 手动维护 | DotAgent |
|--------|---------|------------------|
| 修改编码规范 | 需要改4-7个文件 | 改一处，一键同步 |
| API Key/中转站配置 | 每个工具单独设置，反复复制粘贴 | 一处配置，自动应用到所有工具 |
| 新项目初始化 | 从其他项目复制粘贴配置 | `dotagent init` 自动检测导入+推荐模板 |
| 工具特定规则 | 需要记住每个工具的格式 | 可视化选择作用域，自动转换格式 |
| 经验积累 | 规则分散在各个项目中 | 全局Profile持续迭代，片段库沉淀可复用经验 |
| 项目差异 | 手动管理哪些规则覆盖 | 清晰的继承/覆盖/禁用可视化机制 |
| API Key安全 | 明文存在配置文件里 | 系统密钥环加密存储，界面脱敏显示 |
| 配置备份 | 容易丢失，无历史 | 自动备份，版本历史可回溯 |
| 新工具支持 | 重新写一遍配置 + 重新找API设置 | 新增一个Adapter即可，API配置自动适配 |
| 技术栈识别 | 手动挑选适用模板 | 自动扫描项目文件，识别技术栈推荐片段 |

---

## 确认的决策记录

以下决策已确认，作为后续开发依据：

| 决策项 | 结论 |
|--------|------|
| 技术栈 | Tauri (Rust) + React + TypeScript + TailwindCSS |
| 应用形态 | 桌面GUI + CLI双模式 |
| 同步策略 | 单向同步（本工具为配置管理的统一入口） |
| 继承机制 | 全局→项目→本地个人 三层继承，本地配置自动gitignore |
| MVP首发工具 | Claude Code（完整）+ Codex + Trae + WorkBuddy 共4款 |
| 配置资源类型 | MVP支持Instruction/Rules/Settings基础；Phase2支持Hooks/Skills；Phase3支持Agents/MCP |
| Rules路径限定 | MVP支持，通过pathGlobs实现按需加载，避免上下文膨胀 |
| Hooks | Phase2图形化配置，内置常用模板（自动格式化、危险拦截、通知） |
| Skills/Commands | Phase2支持，从Phase4提升优先级，斜杠命令一处定义多工具共享 |
| AGENTS.md开放标准 | 根目录同步生成AGENTS.md，支持多工具自动识别 |
| 微信小程序/小游戏 | 作为技术栈模板内置，通过自动检测（project.config.json/game.json）推荐规范 |
| 云同步/团队共享 | 架构预留接口，初期只做本地管理 |
| API中转站管理 | ✅ MVP包含，一处配置自动同步到所有工具 |
| 工作流模式 | 不侵入项目创建流程，`dotagent init` 增量接入现有项目 |
| API Key存储 | 使用系统密钥环加密存储，不明文存储 |

---

## 微信小程序/小游戏支持方案

### 支持方式

微信小程序/小游戏作为**特定技术栈**，通过「片段库内置模板 + 项目自动识别 + Rules路径限定」三个机制实现完美支持，不需要做专门的功能定制：

### 1. 技术栈自动检测

项目初始化时自动检测：

| 检测文件 | 识别为 | 推荐配置 |
|---------|--------|---------|
| `project.config.json` + `app.json` + `pages/` | 微信小程序 | 自动应用小程序规范Snippet |
| `game.json` + `game.js` + 无`app.json` | 微信小游戏 | 自动应用小游戏规范Snippet |
| `project.config.json` + `plugin.json` | 微信小程序插件 | 自动应用插件开发规范 |
| `cloudfunctions/` 目录存在 | 含云开发 | 自动追加云函数规范Rule |

### 2. 内置规范片段（Snippets）

Phase2内置以下微信生态技术栈模板：

**miniprogram.md（微信小程序规范）**
- 框架约定：app.json配置、页面生命周期（onLoad/onShow/onReady等）
- WXML/WXSS编写规范
- wx API调用最佳实践（异步错误处理、权限申请）
- 自定义组件开发规范
- 分包加载策略
- 性能优化建议（setData优化、图片资源）
- 审核/上线注意事项（隐私协议、用户数据合规）
- TypeScript小程序项目规范（如使用）

**minigame.md（微信小游戏规范）**
- Canvas渲染最佳实践
- 资源加载与缓存管理
- 微信小游戏API使用（wx.createCanvas等）
- 适配不同屏幕尺寸
- 性能优化（帧率控制、内存管理）
- 广告/分享/支付接口规范
- 分包加载与启动优化

### 3. Rules路径限定规则

利用Rules的pathGlobs特性，做到精准加载：

| Rule | pathGlobs | 说明 |
|------|-----------|------|
| `rules/miniprogram-page.md` | `pages/**/*.{js,ts,wxml,wxss}` | 页面文件加载小程序页面规范 |
| `rules/miniprogram-component.md` | `components/**/*.{js,ts,wxml,wxss}` | 组件文件加载组件规范 |
| `rules/miniprogram-cloud.md` | `cloudfunctions/**/*.{js,ts}` | 云函数文件加载云开发规范 |
| `rules/minigame-core.md` | `src/**/*.js` | 小游戏核心逻辑加载游戏规范 |
| `rules/wxss-style.md` | `**/*.wxss` | 所有wxss文件加载样式规范 |

这样AI在帮你写代码时：
- 编辑普通JS/TS业务逻辑 → 看到通用编码规范
- 编辑`pages/`下的页面 → 额外看到小程序页面生命周期规范
- 编辑`cloudfunctions/`下的云函数 → 额外看到云函数开发规范
- 编辑`game.js` → 自动加载小游戏Canvas/性能规范

不污染其他项目的上下文，只在相关文件时加载对应规则。

### 4. 常用Skill/Hook模板

Phase2提供微信生态专用Skill：

- `/miniprogram-new-page`：新建小程序页面脚手架（自动创建js/json/wxml/wxss四个文件）
- `/miniprogram-submit-review`：小程序提交前检查清单（隐私协议、权限配置、测试覆盖）
- `/minigame-optimize`：小游戏性能优化检查
- Hook模板：微信开发者工具命令行调用（编译/预览/上传自动化）

