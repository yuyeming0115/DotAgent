import { useState } from 'react'

interface Snippet {
  id: string
  name: string
  content: string
  language: string
  tags: string[]
}

const mockSnippets: Snippet[] = [
  {
    id: '1',
    name: 'Python 函数模板',
    content: 'def function_name(param: Type) -> ReturnType:\n    """Docstring."""\n    pass',
    language: 'python',
    tags: ['python', 'function'],
  },
  {
    id: '2',
    name: 'React 组件模板',
    content: 'import React from "react"\n\ninterface Props {\n  name: string\n}\n\nexport const Component: React.FC<Props> = ({ name }) => {\n  return <div>{name}</div>\n}',
    language: 'typescript',
    tags: ['react', 'component', 'typescript'],
  },
  {
    id: '3',
    name: 'Rust 结构体',
    content: 'struct User {\n    name: String,\n    age: u32,\n}\n\nimpl User {\n    fn new(name: String, age: u32) -> Self {\n        Self { name, age }\n    }\n}',
    language: 'rust',
    tags: ['rust', 'struct'],
  },
  {
    id: '4',
    name: '微信小程序页面',
    content: 'Page({\n  data: {\n    title: "Hello World"\n  },\n  onLoad() {\n    console.log("Page loaded")\n  }\n})',
    language: 'javascript',
    tags: ['wechat', 'miniprogram'],
  },
]

const languages = ['all', 'python', 'typescript', 'javascript', 'rust']

function SnippetLibrary() {
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSnippets = mockSnippets.filter((snippet) => {
    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesLanguage && matchesSearch
  })

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索片段..."
                className="w-64 bg-bg-surface border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
            </div>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-primary text-white'
                      : 'bg-bg-surface text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {lang === 'all' ? '全部' : lang}
                </button>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium">
            添加片段
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredSnippets.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => setSelectedSnippet(snippet)}
              className={`p-4 bg-card rounded-lg border text-left transition-colors ${
                selectedSnippet?.id === snippet.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text">{snippet.name}</span>
                <span className="px-2 py-0.5 bg-bg-surface border border-border rounded text-xs text-text-secondary">
                  {snippet.language}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {snippet.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-bg-surface rounded text-[10px] text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
              <pre className="text-xs text-text-secondary font-mono overflow-hidden text-ellipsis whitespace-pre-wrap line-clamp-3">
                {snippet.content}
              </pre>
            </button>
          ))}
        </div>
      </div>
      <div className="w-96 flex-shrink-0">
        {selectedSnippet ? (
          <div className="h-full bg-card rounded-lg border border-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text">{selectedSnippet.name}</h3>
              <button className="px-3 py-1 bg-success/20 text-success rounded-lg text-xs hover:bg-success/30 transition-colors">
                复制
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedSnippet.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-bg-surface rounded text-xs text-text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="text-sm text-text font-mono whitespace-pre-wrap">{selectedSnippet.content}</pre>
            </div>
          </div>
        ) : (
          <div className="h-full bg-card rounded-lg border border-border flex items-center justify-center text-text-muted">
            选择一个片段查看详情
          </div>
        )}
      </div>
    </div>
  )
}

export default SnippetLibrary
