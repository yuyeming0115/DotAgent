import { useState } from 'react'

interface ProjectConfigProps {
  projectName: string
}

interface ConfigSection {
  id: string
  title: string
  icon: string
  items: { id: string; name: string; status: 'active' | 'inherit' | 'disabled' }[]
}

const mockSections: ConfigSection[] = [
  {
    id: 'instructions',
    title: '主指令',
    icon: '📝',
    items: [
      { id: '1', name: '项目主指令', status: 'active' },
      { id: '2', name: '全局主指令', status: 'inherit' },
    ],
  },
  {
    id: 'rules',
    title: 'Rules',
    icon: '📜',
    items: [
      { id: '1', name: '项目 Python 规则', status: 'active' },
      { id: '2', name: '全局 Python 规则', status: 'disabled' },
      { id: '3', name: '全局 React 规则', status: 'inherit' },
    ],
  },
  {
    id: 'hooks',
    title: 'Hooks',
    icon: '🔗',
    items: [
      { id: '1', name: '项目 Auto Format', status: 'active' },
      { id: '2', name: '全局 Auto Format', status: 'inherit' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: '🎯',
    items: [
      { id: '1', name: '项目代码审查', status: 'active' },
      { id: '2', name: '全局代码审查', status: 'disabled' },
    ],
  },
]

function ProjectConfig({ projectName }: ProjectConfigProps) {
  const [activeSection, setActiveSection] = useState('instructions')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const getStatusBadge = (status: 'active' | 'inherit' | 'disabled') => {
    switch (status) {
      case 'active':
        return <span className="px-1.5 py-0.5 bg-success/20 text-success text-[10px] rounded">自定义</span>
      case 'inherit':
        return <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded">继承</span>
      case 'disabled':
        return <span className="px-1.5 py-0.5 bg-text-muted/20 text-text-muted text-[10px] rounded">禁用</span>
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6">
      <div className="w-64 flex-shrink-0">
        <div className="p-4 bg-card rounded-lg border border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{projectName[0]}</span>
            </div>
            <div>
              <div className="font-semibold text-text">{projectName}</div>
              <div className="text-xs text-text-muted">项目配置</div>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          {mockSections.map((section) => (
            <div key={section.id}>
              <div
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  activeSection === section.id ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-border/50'
                }`}
              >
                <span>{section.icon}</span>
                <span className="font-medium">{section.title}</span>
                <span className="ml-auto text-xs text-text-muted">{section.items.length}</span>
              </div>
              {activeSection === section.id && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedItem === item.id ? 'bg-border text-text' : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {getStatusBadge(item.status)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-card rounded-lg border border-border p-6">
        {selectedItem ? (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">项目主指令</h2>
            <div className="flex-1 bg-bg-surface border border-border rounded-lg p-4 text-text font-mono text-sm overflow-auto whitespace-pre-wrap h-[calc(100%-40px)]">
              # Project Instructions

This is a Tauri + React project.

## Tech Stack
- Rust (Tauri 2.x)
- React + TypeScript
- TailwindCSS

## Coding Standards
- Use TypeScript for all components
- Follow React hooks best practices
- Keep functions small and focused
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            请选择一个配置项查看
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectConfig
