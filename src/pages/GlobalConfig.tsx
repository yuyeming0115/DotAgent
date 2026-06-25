import { useState } from 'react'

type ResourceType = 'instructions' | 'rules' | 'settings' | 'hooks' | 'skills'

const resourceTabs: { id: ResourceType; label: string; icon: string }[] = [
  { id: 'instructions', label: '主指令', icon: '📝' },
  { id: 'rules', label: 'Rules', icon: '📜' },
  { id: 'settings', label: '设置', icon: '⚙️' },
  { id: 'hooks', label: 'Hooks', icon: '🔗' },
  { id: 'skills', label: 'Skills', icon: '🎯' },
]

interface ConfigResource {
  id: string
  name: string
  content: string
  path_globs: string[]
  updated_at: string
}

const mockResources: Record<ResourceType, ConfigResource[]> = {
  instructions: [
    { id: '1', name: '全局主指令', content: '# Global Instructions\n\nYou are an expert AI coding assistant.', path_globs: [], updated_at: '2026-06-25' },
  ],
  rules: [
    { id: '1', name: 'Python 编码规范', content: '# Python Coding Standards\n\n- Use type hints\n- Follow PEP8', path_globs: ['**/*.py'], updated_at: '2026-06-25' },
    { id: '2', name: 'React 规则', content: '# React Rules\n\n- Use TypeScript\n- Use functional components', path_globs: ['**/*.tsx', '**/*.jsx'], updated_at: '2026-06-25' },
  ],
  settings: [
    { id: '1', name: '全局设置', content: '{\n  "defaultModel": "claude-3.7",\n  "temperature": 0.7\n}', path_globs: [], updated_at: '2026-06-25' },
  ],
  hooks: [
    { id: '1', name: 'Auto Format', content: '// Auto format on save\nexport const preToolUse = async () => {\n  // format code\n}', path_globs: [], updated_at: '2026-06-25' },
  ],
  skills: [
    { id: '1', name: '代码审查', content: '# Code Review Skill\n\n## Command\n/review\n\n## Description\nReview code quality.', path_globs: [], updated_at: '2026-06-25' },
  ],
}

function GlobalConfig() {
  const [activeTab, setActiveTab] = useState<ResourceType>('instructions')
  const [selectedResource, setSelectedResource] = useState<ConfigResource | null>(mockResources[activeTab][0] || null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const resources = mockResources[activeTab]

  const handleEdit = (resource: ConfigResource) => {
    setSelectedResource(resource)
    setEditContent(resource.content)
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    if (selectedResource) {
      selectedResource.content = editContent
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6">
      <div className="w-64 flex-shrink-0">
        <div className="flex border-b border-border mb-3">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSelectedResource(mockResources[tab.id][0] || null)
                setIsEditing(false)
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          {resources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => {
                setSelectedResource(resource)
                setIsEditing(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedResource?.id === resource.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-secondary hover:bg-border/50 hover:text-text'
              }`}
            >
              <div className="font-medium truncate">{resource.name}</div>
              {resource.path_globs.length > 0 && (
                <div className="text-xs text-text-muted truncate">{resource.path_globs.join(', ')}</div>
              )}
            </button>
          ))}
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-border/50 transition-colors">
            <span className="mr-2">➕</span>添加新资源
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedResource ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text">{selectedResource.name}</h2>
                {selectedResource.path_globs.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {selectedResource.path_globs.map((glob, i) => (
                      <span key={i} className="px-2 py-0.5 bg-bg-surface border border-border rounded text-xs text-text-secondary">
                        {glob}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/80 transition-colors">保存</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-border rounded-lg text-text-secondary text-sm hover:text-text transition-colors">取消</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(selectedResource)} className="px-4 py-2 border border-border rounded-lg text-text-secondary text-sm hover:text-text transition-colors">编辑</button>
                )}
              </div>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-bg-surface border border-border rounded-lg p-4 text-text font-mono text-sm resize-none focus:outline-none focus:border-primary"
                />
              ) : (
                <div className="w-full h-full bg-bg-surface border border-border rounded-lg p-4 text-text font-mono text-sm overflow-auto whitespace-pre-wrap">
                  {selectedResource.content}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            请选择一个资源查看
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalConfig
