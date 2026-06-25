import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import type { ResourceType } from '../types'

const resourceTabs: { id: ResourceType; label: string; icon: string }[] = [
  { id: 'instructions', label: '主指令', icon: '📝' },
  { id: 'rules', label: 'Rules', icon: '📜' },
  { id: 'settings', label: '设置', icon: '⚙️' },
  { id: 'hooks', label: 'Hooks', icon: '🔗' },
  { id: 'skills', label: 'Skills', icon: '🎯' },
]

function GlobalConfig() {
  const { configResources, addConfigResource, updateConfigResource, deleteConfigResource } = useApp()
  const [activeTab, setActiveTab] = useState<ResourceType>('instructions')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editName, setEditName] = useState('')
  const [editPathGlobs, setEditPathGlobs] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPathGlobs, setNewPathGlobs] = useState('')

  const resources = useMemo(
    () => configResources.filter((r) => r.resourceType === activeTab),
    [configResources, activeTab]
  )

  const selectedResource = useMemo(
    () => configResources.find((r) => r.id === selectedId) || null,
    [configResources, selectedId]
  )

  useEffect(() => {
    if (resources.length > 0 && !selectedId) {
      setSelectedId(resources[0].id)
    }
  }, [resources, selectedId])

  useEffect(() => {
    setSelectedId(null)
  }, [activeTab])

  const startEdit = () => {
    if (!selectedResource) return
    setEditName(selectedResource.name)
    setEditContent(selectedResource.content)
    setEditPathGlobs(selectedResource.pathGlobs.join(', '))
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!selectedResource) return
    const globList = editPathGlobs.split(',').map((g) => g.trim()).filter(Boolean)
    updateConfigResource(selectedResource.id, {
      name: editName,
      content: editContent,
      pathGlobs: globList,
    })
    setIsEditing(false)
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    const globList = newPathGlobs.split(',').map((g) => g.trim()).filter(Boolean)
    addConfigResource({
      name: newName,
      content: `# ${newName}\n\n`,
      resourceType: activeTab,
      pathGlobs: globList,
      description: '',
      isEnabled: true,
    })
    setShowAddModal(false)
    setNewName('')
    setNewPathGlobs('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个资源吗？')) {
      deleteConfigResource(id)
      if (selectedId === id) setSelectedId(null)
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6">
      <div className="w-64 flex-shrink-0 flex flex-col">
        <div className="flex border-b border-border mb-3">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text'
              }`}
            >
              <span className="block">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={`group relative w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                selectedId === resource.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-secondary hover:bg-border/50 hover:text-text'
              }`}
              onClick={() => setSelectedId(resource.id)}
            >
              <div className="font-medium truncate pr-16">{resource.name}</div>
              {resource.pathGlobs.length > 0 && (
                <div className="text-xs text-text-muted truncate">{resource.pathGlobs.join(', ')}</div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(resource.id) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-border/50 transition-colors"
          >
            <span className="mr-2">➕</span>添加新{resourceTabs.find((t) => t.id === activeTab)?.label}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedResource ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-lg font-semibold text-text bg-bg-surface border border-border rounded-lg px-3 py-1 focus:outline-none focus:border-primary"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-text">{selectedResource.name}</h2>
                )}
                {isEditing ? (
                  <div className="mt-2">
                    <label className="block text-xs text-text-muted mb-1">路径匹配（逗号分隔）</label>
                    <input
                      type="text"
                      value={editPathGlobs}
                      onChange={(e) => setEditPathGlobs(e.target.value)}
                      placeholder="**/*.py, **/*.ts"
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary"
                    />
                  </div>
                ) : selectedResource.pathGlobs.length > 0 ? (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedResource.pathGlobs.map((glob, i) => (
                      <span key={i} className="px-2 py-0.5 bg-bg-surface border border-border rounded text-xs text-text-secondary font-mono">
                        {glob}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/80 transition-colors">
                      💾 保存
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-border rounded-lg text-text-secondary text-sm hover:text-text transition-colors">
                      取消
                    </button>
                  </>
                ) : (
                  <button onClick={startEdit} className="px-4 py-2 border border-border rounded-lg text-text-secondary text-sm hover:text-text transition-colors">
                    ✏️ 编辑
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-bg-surface border border-border rounded-lg p-4 text-text font-mono text-sm resize-none focus:outline-none focus:border-primary"
                  spellCheck={false}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-lg border border-border p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text mb-4">
              添加{resourceTabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="请输入名称"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">路径匹配（逗号分隔，可选）</label>
                <input
                  type="text"
                  value={newPathGlobs}
                  onChange={(e) => setNewPathGlobs(e.target.value)}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="**/*.py, **/*.ts"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text transition-colors">
                  取消
                </button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalConfig
