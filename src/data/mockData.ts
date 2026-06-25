import type { ApiProfile, ConfigResource, Project, Snippet } from '../types'

export const mockApiProfiles: ApiProfile[] = [
  {
    id: 'prof-001',
    name: '官方 Anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiKey: 'sk-ant-****************************',
    provider: 'anthropic',
    models: ['Claude 3.7 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
    isDefault: true,
    latency: 120,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-25T09:30:00Z',
  },
  {
    id: 'prof-002',
    name: 'Proxy A - 高速',
    baseUrl: 'https://api-proxy-a.example.com/v1',
    apiKey: 'sk-****************************',
    provider: 'proxy',
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
    isDefault: false,
    latency: 85,
    createdAt: '2026-06-21T14:00:00Z',
    updatedAt: '2026-06-24T16:00:00Z',
  },
  {
    id: 'prof-003',
    name: 'Azure OpenAI',
    baseUrl: 'https://azure-openai-eastus.example.com',
    apiKey: '***-*****************',
    provider: 'azure',
    models: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
    isDefault: false,
    latency: 150,
    createdAt: '2026-06-22T08:00:00Z',
    updatedAt: '2026-06-23T11:00:00Z',
  },
]

export const mockConfigResources: ConfigResource[] = [
  {
    id: 'inst-001',
    name: '全局主指令',
    content: `# Global Instructions

你是一个专业的AI编程助手。

## 核心原则
- 代码要清晰、简洁、有良好的注释
- 遵循各语言的最佳实践
- 优先考虑可读性和可维护性
- 遇到不确定的地方要主动询问

## 工作方式
- 先理解需求，再开始编码
- 分步实现，逐步验证
- 写完后要自查一遍`,
    resourceType: 'instructions',
    pathGlobs: [],
    description: '全局默认主指令，所有项目继承',
    isEnabled: true,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-25T09:00:00Z',
  },
  {
    id: 'rule-001',
    name: 'Python 编码规范',
    content: `# Python Coding Standards

## 代码风格
- 遵循 PEP 8 规范
- 使用 4 空格缩进
- 行宽不超过 120 字符
- 变量名使用 snake_case
- 类名使用 PascalCase

## 类型提示
- 所有函数必须有类型注解
- 使用 typing 模块的类型
- 复杂类型要加注释

## 文档
- 每个函数要有 docstring
- 使用 Google 风格文档字符串
- 说明参数、返回值、异常`,
    resourceType: 'rules',
    pathGlobs: ['**/*.py'],
    description: 'Python文件自动加载',
    isEnabled: true,
    createdAt: '2026-06-21T10:00:00Z',
    updatedAt: '2026-06-24T14:00:00Z',
  },
  {
    id: 'rule-002',
    name: 'React + TypeScript 规则',
    content: `# React + TypeScript Rules

## 组件规范
- 使用函数组件 + hooks
- 组件文件使用 .tsx 后缀
- Props 必须定义 interface
- 导出使用具名导出

## 状态管理
- 优先使用 useState/useReducer
- 复杂状态考虑 Context
- 避免 prop drilling

## 样式
- 使用 Tailwind CSS
- 组件内聚样式
- 响应式设计优先移动端

## 性能
- 列表渲染要有 key
- 合理使用 useMemo/useCallback
- 避免不必要的重渲染`,
    resourceType: 'rules',
    pathGlobs: ['**/*.tsx', '**/*.jsx'],
    description: 'React组件文件自动加载',
    isEnabled: true,
    createdAt: '2026-06-21T11:00:00Z',
    updatedAt: '2026-06-25T08:00:00Z',
  },
  {
    id: 'rule-003',
    name: 'Rust 编码规范',
    content: `# Rust Coding Standards

## 代码风格
- 遵循 rustfmt 格式
- 使用 4 空格缩进
- 变量名使用 snake_case
- 类型/结构体使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

## 错误处理
- 优先使用 Result 类型
- 合理使用 ? 操作符
- 避免在生产代码中使用 unwrap()

## 内存安全
- 优先使用借用而不是转移所有权
- 合理使用生命周期注解
- 避免 unsafe 代码`,
    resourceType: 'rules',
    pathGlobs: ['**/*.rs'],
    description: 'Rust文件自动加载',
    isEnabled: true,
    createdAt: '2026-06-22T10:00:00Z',
    updatedAt: '2026-06-23T15:00:00Z',
  },
  {
    id: 'setting-001',
    name: '全局设置',
    content: `{
  "defaultModel": "claude-3-7-sonnet",
  "maxTokens": 8192,
  "temperature": 0.7,
  "permissions": {
    "allowCreateFile": true,
    "allowEditFile": true,
    "allowDeleteFile": false,
    "allowExecuteCommand": "ask",
    "allowBashTool": true
  },
  "features": {
    "autoSuggestions": true,
    "codeReview": true,
    "explainCode": true
  }
}`,
    resourceType: 'settings',
    pathGlobs: [],
    description: '全局默认设置',
    isEnabled: true,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'hook-001',
    name: '保存自动格式化',
    content: `// Auto-format on file write
// Trigger: PostToolUse when tool=write_file
import { formatFile } from '../utils/format'

export async function postToolUse(ctx) {
  if (ctx.tool.name !== 'write_file') return

  const filePath = ctx.tool.args.file_path
  const ext = filePath.split('.').pop()?.toLowerCase()

  if (['ts', 'tsx', 'js', 'jsx', 'json'].includes(ext)) {
    try {
      await formatFile(filePath, 'prettier')
      ctx.log.info(\`Formatted \${filePath}\`)
    } catch (e) {
      ctx.log.warn(\`Format failed: \${e.message}\`)
    }
  }
}`,
    resourceType: 'hooks',
    pathGlobs: [],
    description: '写文件后自动用Prettier格式化',
    isEnabled: true,
    createdAt: '2026-06-22T10:00:00Z',
    updatedAt: '2026-06-24T10:00:00Z',
  },
  {
    id: 'hook-002',
    name: '危险命令拦截',
    content: `// Block dangerous commands
// Trigger: PreToolUse when tool=bash
const DANGEROUS_PATTERNS = [
  /^rm\\s+-rf\\s+\\/?$/,
  /^dd\\s+/,
  /^mkfs\\./,
  /:\\(\\)\\{\\s*:\\|:&\\s*\\};\\s*:/,
  /^sudo\\s+rm\\s+-rf\\s+\\//,
]

export function preToolUse(ctx) {
  if (ctx.tool.name !== 'bash') return

  const cmd = ctx.tool.args.command?.trim() || ''

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cmd)) {
      ctx.cancel(\`Dangerous command blocked: \${cmd}\`)
      return
    }
  }
}`,
    resourceType: 'hooks',
    pathGlobs: [],
    description: '拦截危险shell命令，防止误操作',
    isEnabled: true,
    createdAt: '2026-06-23T10:00:00Z',
    updatedAt: '2026-06-25T09:00:00Z',
  },
  {
    id: 'skill-001',
    name: '代码审查',
    content: `# Code Review Skill

## Command
/review [--scope=file|function|project]

## Description
对代码进行全面审查，发现潜在问题并提出改进建议。

## Review Checklist
- [ ] 代码逻辑正确性
- [ ] 边界条件处理
- [ ] 错误处理是否完善
- [ ] 性能问题
- [ ] 安全隐患
- [ ] 代码可读性
- [ ] 是否符合编码规范
- [ ] 是否有重复代码
- [ ] 命名是否清晰

## Output Format
1. 总体评价（好/中/需改进）
2. 严重问题（必须修复）
3. 建议改进（可选优化）
4. 代码风格问题
5. 正面肯定

## Example
\`\`\`
/review --scope=file src/utils/auth.ts
\`\`\``,
    resourceType: 'skills',
    pathGlobs: [],
    description: '使用 /review 命令对代码进行审查',
    isEnabled: true,
    createdAt: '2026-06-21T10:00:00Z',
    updatedAt: '2026-06-24T12:00:00Z',
  },
  {
    id: 'skill-002',
    name: '代码解释',
    content: `# Code Explain Skill

## Command
/explain [--level=beginner|intermediate|advanced]

## Description
用通俗易懂的语言解释代码的工作原理。

## Explanation Structure
1. 概览：这段代码是做什么的
2. 核心逻辑：关键算法/流程
3. 数据流向：输入输出是什么
4. 关键函数/类：逐一解释
5. 注意事项：边界情况、潜在坑点

## Adjust to Level
- beginner: 多用比喻，避免专业术语
- intermediate: 正常技术术语，解释关键概念
- advanced: 深入细节，讨论设计决策和权衡

## Example
\`\`\`
/explain --level=intermediate
\`\`\``,
    resourceType: 'skills',
    pathGlobs: [],
    description: '使用 /explain 命令解释选中的代码',
    isEnabled: true,
    createdAt: '2026-06-22T10:00:00Z',
    updatedAt: '2026-06-23T14:00:00Z',
  },
]

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'DotAgent',
    path: 'D:\\GitWork\\DotAgent',
    description: 'AI Agent 统一配置管理平台',
    techStack: ['rust', 'tauri', 'react', 'typescript', 'tailwindcss'],
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'proj-002',
    name: 'MyBlog',
    path: 'D:\\GitWork\\MyBlog',
    description: '个人博客系统',
    techStack: ['python', 'django', 'react', 'postgresql'],
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-06-20T15:00:00Z',
  },
]

export const mockSnippets: Snippet[] = [
  {
    id: 'snip-001',
    name: 'Python 函数模板',
    content: `def function_name(param1: Type1, param2: Type2) -> ReturnType:
    """Brief description of what the function does.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: If something goes wrong
    """
    # Function implementation
    pass`,
    language: 'python',
    tags: ['python', 'function', 'template'],
    description: '标准Python函数模板，包含类型注解和文档字符串',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'snip-002',
    name: 'React 组件模板',
    content: `import React from 'react'

interface ComponentNameProps {
  /** 显示文本 */
  text: string
  /** 点击回调 */
  onClick?: () => void
  /** 是否禁用 */
  disabled?: boolean
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  text,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-lg"
    >
      {text}
    </button>
  )
}`,
    language: 'typescript',
    tags: ['react', 'component', 'typescript', 'template'],
    description: '标准React函数组件模板，TypeScript + Interface',
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z',
  },
  {
    id: 'snip-003',
    name: 'Rust 结构体 + impl',
    content: `use std::fmt;

#[derive(Debug, Clone)]
pub struct User {
    name: String,
    age: u32,
    email: Option<String>,
}

impl User {
    pub fn new(name: &str, age: u32) -> Self {
        Self {
            name: name.to_string(),
            age,
            email: None,
        }
    }

    pub fn with_email(mut self, email: &str) -> Self {
        self.email = Some(email.to_string());
        self
    }

    pub fn greet(&self) -> String {
        format!("Hello, I'm {}!", self.name)
    }
}

impl fmt::Display for User {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "User(name: {}, age: {})", self.name, self.age)
    }
}`,
    language: 'rust',
    tags: ['rust', 'struct', 'impl', 'builder-pattern'],
    description: 'Rust结构体定义 + impl块 + Builder模式示例',
    createdAt: '2026-06-21T10:00:00Z',
    updatedAt: '2026-06-21T10:00:00Z',
  },
  {
    id: 'snip-004',
    name: '微信小程序页面模板',
    content: `Page({
  data: {
    title: '页面标题',
    list: [],
    loading: false,
  },

  onLoad(options) {
    console.log('Page loaded with options:', options)
    this.loadData()
  },

  onShow() {
    console.log('Page shown')
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const res = await wx.request({
        url: '/api/data',
        method: 'GET',
      })
      this.setData({ list: res.data })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  handleTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: \`/pages/detail/detail?id=\${id}\` })
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },
})`,
    language: 'javascript',
    tags: ['wechat', 'miniprogram', 'page', 'template'],
    description: '微信小程序标准页面模板，包含常用生命周期和方法',
    createdAt: '2026-06-22T10:00:00Z',
    updatedAt: '2026-06-22T10:00:00Z',
  },
  {
    id: 'snip-005',
    name: 'TypeScript UseFetch Hook',
    content: `import { useState, useEffect, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface FetchOptions extends RequestInit {
  immediate?: boolean
}

export function useFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
) {
  const { immediate = true, ...fetchOptions } = options
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const execute = useCallback(
    async (executeOptions?: RequestInit) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const res = await fetch(url, { ...fetchOptions, ...executeOptions })
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        const data = (await res.json()) as T
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false, error: error as Error }))
        throw error
      }
    },
    [url, JSON.stringify(fetchOptions)]
  )

  useEffect(() => {
    if (immediate) execute()
  }, [immediate, execute])

  return { ...state, execute, refetch: execute }
}`,
    language: 'typescript',
    tags: ['react', 'hooks', 'typescript', 'fetch'],
    description: '通用useFetch Hook，支持手动触发和自动请求',
    createdAt: '2026-06-23T10:00:00Z',
    updatedAt: '2026-06-23T10:00:00Z',
  },
]
