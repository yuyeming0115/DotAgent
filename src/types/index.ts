export interface ApiProfile {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  provider: string
  models: string[]
  isDefault: boolean
  latency?: number
  createdAt: string
  updatedAt: string
}

export interface ConfigResource {
  id: string
  name: string
  content: string
  resourceType: 'instructions' | 'rules' | 'settings' | 'hooks' | 'skills'
  pathGlobs: string[]
  description?: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  path: string
  description: string
  techStack: string[]
  createdAt: string
  updatedAt: string
}

export interface Snippet {
  id: string
  name: string
  content: string
  language: string
  tags: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

export type ResourceType = 'instructions' | 'rules' | 'settings' | 'hooks' | 'skills'

export type PageType = 'dashboard' | 'api' | 'global' | 'project' | 'snippets'
