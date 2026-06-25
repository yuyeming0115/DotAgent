import type { PageType } from '../types'

interface SidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

const menuItems: { id: PageType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'api', label: 'API配置', icon: '🔌' },
  { id: 'global', label: '全局配置', icon: '🌍' },
  { id: 'project', label: '项目配置', icon: '📁' },
  { id: 'snippets', label: '片段库', icon: '📋' },
]

function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 bg-bg-surface border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">DA</span>
          </div>
          <span className="font-semibold text-text">DotAgent</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              currentPage === item.id
                ? 'bg-primary/15 text-primary'
                : 'text-text-secondary hover:bg-border/50 hover:text-text'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <div className="text-xs text-text-muted text-center">v0.1.0</div>
      </div>
    </aside>
  )
}

export default Sidebar
