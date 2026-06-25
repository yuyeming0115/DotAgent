import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { ApiProfile } from '../types'

const providerIcons: Record<string, { icon: string; color: string }> = {
  anthropic: { icon: '🤖', color: 'bg-orange-500/20 text-orange-400' },
  openai: { icon: '💡', color: 'bg-green-500/20 text-green-400' },
  azure: { icon: '☁️', color: 'bg-blue-500/20 text-blue-400' },
  proxy: { icon: '🔄', color: 'bg-purple-500/20 text-purple-400' },
  deepseek: { icon: '🔷', color: 'bg-cyan-500/20 text-cyan-400' },
}

function ApiConfig() {
  const { apiProfiles, addApiProfile, updateApiProfile, deleteApiProfile, setDefaultApiProfile, testApiConnection } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ApiProfile | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    provider: 'anthropic',
    models: '',
  })

  const openAddModal = () => {
    setEditingProfile(null)
    setFormData({ name: '', baseUrl: '', apiKey: '', provider: 'anthropic', models: '' })
    setShowModal(true)
  }

  const openEditModal = (profile: ApiProfile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      baseUrl: profile.baseUrl,
      apiKey: profile.apiKey,
      provider: profile.provider,
      models: profile.models.join(', '),
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.baseUrl.trim()) return
    const modelList = formData.models.split(',').map((m) => m.trim()).filter(Boolean)

    if (editingProfile) {
      updateApiProfile(editingProfile.id, {
        name: formData.name,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey,
        provider: formData.provider,
        models: modelList,
      })
    } else {
      addApiProfile({
        name: formData.name,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey,
        provider: formData.provider,
        models: modelList,
        isDefault: apiProfiles.length === 0,
      })
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个API方案吗？')) {
      deleteApiProfile(id)
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    await testApiConnection(id)
    setTestingId(null)
  }

  const getProviderStyle = (provider: string) =>
    providerIcons[provider] || { icon: '🔌', color: 'bg-gray-500/20 text-gray-400' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">管理所有AI工具的API端点和密钥配置</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
        >
          ➕ 添加API方案
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {apiProfiles.map((profile) => {
          const style = getProviderStyle(profile.provider)
          return (
            <div
              key={profile.id}
              className={`p-4 bg-card rounded-lg border cursor-pointer group transition-colors ${
                profile.isDefault ? 'border-success/30 hover:border-success/50' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => openEditModal(profile)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${style.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{style.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate text-text">{profile.name}</span>
                    {profile.isDefault && (
                      <span className="px-1.5 py-0.5 bg-success/20 text-success text-[10px] rounded flex-shrink-0">默认</span>
                    )}
                  </div>
                  <span className="px-1.5 py-0.5 bg-card border border-border text-text-secondary text-[10px] rounded">
                    {profile.provider}
                  </span>
                </div>
              </div>
              <div className="text-xs text-text-secondary space-y-1 mb-3">
                <div className="truncate font-mono" title={profile.baseUrl}>
                  🔗 {profile.baseUrl}
                </div>
                <div className="truncate" title={profile.models.join(', ')}>
                  🤖 {profile.models.join(', ')}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className={`flex items-center gap-1 text-xs ${testingId === profile.id ? 'text-warning' : 'text-success'}`}>
                  {testingId === profile.id ? (
                    <>⏳ 测试中...</>
                  ) : (
                    <>✓ {profile.latency ?? '--'}ms</>
                  )}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTest(profile.id) }}
                    className="p-1.5 text-text-muted hover:text-text hover:bg-border rounded transition-colors"
                    title="测试连接"
                    disabled={testingId === profile.id}
                  >
                    🔌
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(profile) }}
                    className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  {!profile.isDefault && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDefaultApiProfile(profile.id) }}
                      className="p-1.5 text-text-muted hover:text-success hover:bg-success/10 rounded transition-colors"
                      title="设为默认"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(profile.id) }}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        <button
          onClick={openAddModal}
          className="p-4 bg-card/30 border border-dashed border-border rounded-lg text-text-muted hover:text-text-secondary hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-sm min-h-[160px]"
        >
          <span className="text-2xl">➕</span>
          <span>添加新方案</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-lg border border-border p-6 w-[480px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text mb-4">
              {editingProfile ? '编辑API方案' : '添加API方案'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">方案名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="例如：官方 Anthropic"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Base URL *</label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text font-mono focus:outline-none focus:border-primary"
                  placeholder="https://api.anthropic.com"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">API Key</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text font-mono focus:outline-none focus:border-primary"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">服务商</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                >
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="proxy">第三方代理</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">支持模型（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.models}
                  onChange={(e) => setFormData({ ...formData, models: e.target.value })}
                  className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="Claude 3.7 Sonnet, Claude 3.5 Haiku"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiConfig
