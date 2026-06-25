import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import ApiConfig from './pages/ApiConfig'
import GlobalConfig from './pages/GlobalConfig'
import ProjectConfig from './pages/ProjectConfig'
import SnippetLibrary from './pages/SnippetLibrary'
import type { PageType } from './types'

const pageRoutes: Record<string, PageType> = {
  '/': 'dashboard',
  '/api': 'api',
  '/global': 'global',
  '/project': 'project',
  '/snippets': 'snippets',
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = pageRoutes[location.pathname] || 'dashboard'
  const [activeProject, setActiveProject] = useState('DotAgent')

  const handleNavigate = (page: PageType) => {
    navigate(`/${page === 'dashboard' ? '' : page}`)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'api':
        return <ApiConfig />
      case 'global':
        return <GlobalConfig />
      case 'project':
        return <ProjectConfig projectName={activeProject} />
      case 'snippets':
        return <SnippetLibrary />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-bg-base">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} activeProject={activeProject} onProjectChange={setActiveProject} />
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
