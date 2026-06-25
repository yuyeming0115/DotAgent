import type { PageType } from '../App'

interface HeaderProps {
  currentPage: PageType
  activeProject: string
  onProjectChange: (project: string) => void
}

const pageTitles: Record<PageType, string> = {
  dashboard: 'Dashboard',
  api: 'API配置中心',
  global: '全局配置',
  project: '项目配置',
  snippets: '片段库',
}

function Header({ currentPage, activeProject, onProjectChange }: HeaderProps) {
  return (
    <header className="h-14 bg-bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-text">{pageTitles[currentPage]}</h1>
        {currentPage === 'project' && (
          <div className="flex items-center gap-2">
            <select
              value={activeProject}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary"
            >
              <option value="DotAgent">DotAgent</option>
              <option value="MyProject">MyProject</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-text hover:bg-border/50 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
          U
        </button>
      </div>
    </header>
  )
}

export default Header
