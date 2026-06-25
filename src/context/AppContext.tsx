import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { ApiProfile, ConfigResource, Project, Snippet } from '../types'
import { mockApiProfiles, mockConfigResources, mockProjects, mockSnippets } from '../data/mockData'

interface AppState {
  apiProfiles: ApiProfile[]
  configResources: ConfigResource[]
  projects: Project[]
  snippets: Snippet[]
  activeProjectId: string
}

interface AppContextType extends AppState {
  setActiveProject: (id: string) => void
  addApiProfile: (profile: Omit<ApiProfile, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateApiProfile: (id: string, profile: Partial<ApiProfile>) => void
  deleteApiProfile: (id: string) => void
  setDefaultApiProfile: (id: string) => void
  testApiConnection: (id: string) => Promise<{ success: boolean; latency: number; error?: string }>
  addConfigResource: (resource: Omit<ConfigResource, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateConfigResource: (id: string, resource: Partial<ConfigResource>) => void
  deleteConfigResource: (id: string) => void
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSnippet: (id: string, snippet: Partial<Snippet>) => void
  deleteSnippet: (id: string) => void
  addProject: (path: string, name: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

const nowIso = () => new Date().toISOString()
const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiProfiles, setApiProfiles] = useState<ApiProfile[]>(mockApiProfiles)
  const [configResources, setConfigResources] = useState<ConfigResource[]>(mockConfigResources)
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [snippets, setSnippets] = useState<Snippet[]>(mockSnippets)
  const [activeProjectId, setActiveProjectId] = useState<string>(mockProjects[0]?.id || '')

  const setActiveProject = useCallback((id: string) => {
    setActiveProjectId(id)
  }, [])

  const addApiProfile = useCallback((profile: Omit<ApiProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = nowIso()
    const newProfile: ApiProfile = {
      ...profile,
      id: genId('prof'),
      createdAt: now,
      updatedAt: now,
    }
    setApiProfiles((prev) => [...prev, newProfile])
  }, [])

  const updateApiProfile = useCallback((id: string, updates: Partial<ApiProfile>) => {
    setApiProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: nowIso() } : p))
    )
  }, [])

  const deleteApiProfile = useCallback((id: string) => {
    setApiProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setDefaultApiProfile = useCallback((id: string) => {
    setApiProfiles((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    )
  }, [])

  const testApiConnection = useCallback(async (id: string) => {
    const profile = apiProfiles.find((p) => p.id === id)
    if (!profile) return { success: false, latency: 0, error: 'Profile not found' }
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))
    const latency = Math.floor(80 + Math.random() * 120)
    return { success: true, latency }
  }, [apiProfiles])

  const addConfigResource = useCallback((resource: Omit<ConfigResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = nowIso()
    const newResource: ConfigResource = {
      ...resource,
      id: genId(resource.resourceType.slice(0, 4)),
      createdAt: now,
      updatedAt: now,
    }
    setConfigResources((prev) => [...prev, newResource])
  }, [])

  const updateConfigResource = useCallback((id: string, updates: Partial<ConfigResource>) => {
    setConfigResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: nowIso() } : r))
    )
  }, [])

  const deleteConfigResource = useCallback((id: string) => {
    setConfigResources((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addSnippet = useCallback((snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = nowIso()
    const newSnippet: Snippet = {
      ...snippet,
      id: genId('snip'),
      createdAt: now,
      updatedAt: now,
    }
    setSnippets((prev) => [...prev, newSnippet])
  }, [])

  const updateSnippet = useCallback((id: string, updates: Partial<Snippet>) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: nowIso() } : s))
    )
  }, [])

  const deleteSnippet = useCallback((id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addProject = useCallback((path: string, name: string) => {
    const now = nowIso()
    const newProject: Project = {
      id: genId('proj'),
      name,
      path,
      description: '',
      techStack: [],
      createdAt: now,
      updatedAt: now,
    }
    setProjects((prev) => [...prev, newProject])
  }, [])

  const value: AppContextType = {
    apiProfiles,
    configResources,
    projects,
    snippets,
    activeProjectId,
    setActiveProject,
    addApiProfile,
    updateApiProfile,
    deleteApiProfile,
    setDefaultApiProfile,
    testApiConnection,
    addConfigResource,
    updateConfigResource,
    deleteConfigResource,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addProject,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
