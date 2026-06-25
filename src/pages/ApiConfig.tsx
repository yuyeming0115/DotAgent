import { useState } from 'react'

interface ApiProfile {
  id: string
  name: string
  base_url: string
  api_key: string
  provider: string
  models: string[]
  is_default: boolean
}

const mockProfiles: ApiProfile[] = [
  {
    id: '1',
    name: '官方 Anthropic',
    base_url: 'https://api.anthropic.com',
    api_key: 'sk-***',
    provider: 'anthropic',
    models: ['Claude 3.7', 'Claude 3.5 Haiku', 'Opus'],
    is_default: true,
  },
  {
    id: '2',
    name: 'Proxy A',
    base_url: 'https://api-proxy.example.com/v1',
    api_key: 'sk-***',
    provider: 'proxy',
    models: ['Claude 3.5', 'GPT-4o', 'Gemini 1.5'],
    is_default: false,
  },
  {
    id: '3',
    name: 'Azure OpenAI',
    base_url: 'https://azure-openai.example.com',
    api_key: 'sk-***',
    provider: 'azure',
    models: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5'],
    is_default: false,
  },
]

function ApiConfig() {
  const [profiles, setProfiles] = useState<ApiProfile[]>(mockProfiles)
  const [selectedProfile, setSelectedProfile] = useState<ApiProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleSetDefault = (profile: ApiProfile) => {
    setProfiles(profiles.map(p => ({ ...p, is_default: p.id === profile.id })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">管理所有AI工具的API端点和密钥配置</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
        >
          添加API方案
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => setSelectedProfile(profile)}
            className={`p-4 bg-card rounded-lg border cursor-pointer group transition-colors ${
              profile.is_default ? 'border-success/30 hover:border-success/50' : 'border-border hover:border-primary/50'
            } ${selectedProfile?.id === profile.id ? 'ring-2 ring-primary/50' : ''}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 text-lg">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate text-text">{profile.name}</span>
                  {profile.is_default && (
                    <span className="px-1.5 py-0.5 bg-success/20 text-success text-[10px] rounded">默认</span>
                  )}
                </div>
                <span className="px-1.5 py-0.5 bg-card border border-border text-text-secondary text-[10px] rounded">
                  {profile.provider}
                </span>
              </div>
            </div>
            <div className="text-xs text-text-secondary space-y-1 mb-3">
              <div className="truncate">
                <span className="mr-1.5 text-text-muted">🔗</span>
                <span className="font-mono">{profile.base_url}</span>
              </div>
              <div>
                <span className="mr-1.5 text-text-muted">🤖</span>
                {profile.models.join(', ')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="flex items-center gap-1 text-xs text-success">
                <span>✓</span>120ms
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-text-muted hover:text-text hover:bg-border rounded transition-colors" title="测试连接">
                  <span className="text-xs">🔌</span>
                </button>
                <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="编辑">
                  <span className="text-xs">✏️</span>
                </button>
                {!profile.is_default && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(profile) }}
                    className="p-1.5 text-text-muted hover:text-success hover:bg-success/10 rounded transition-colors"
                    title="设为默认"
                  >
                    <span className="text-xs">⭐</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="p-4 bg-card/30 border border-dashed border-border rounded-lg text-text-muted hover:text-text-secondary hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-sm min-h-[160px]"
        >
          <span className="text-2xl">➕</span>
          <span>添加新方案</span>
        </button>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-96">
            <h3 className="text-lg font-semibold text-text mb-4">添加API方案</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">方案名称</label>
                <input type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary" placeholder="例如：官方 Anthropic" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Base URL</label>
                <input type="text" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary" placeholder="https://api.anthropic.com" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">API Key</label>
                <input type="password" className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary" placeholder="sk-..." />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">服务商</label>
                <select className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary">
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                  <option value="azure">Azure</option>
                  <option value="proxy">Proxy</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text transition-colors">取消</button>
                <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiConfig
