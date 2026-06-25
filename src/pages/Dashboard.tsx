function Dashboard() {
  const stats = [
    { label: 'API方案', value: '5', icon: '🔌', color: 'primary' },
    { label: '全局规则', value: '12', icon: '📜', color: 'success' },
    { label: '项目', value: '8', icon: '📁', color: 'warning' },
    { label: '片段', value: '24', icon: '📋', color: 'danger' },
  ]

  const recentActivities = [
    { time: '5分钟前', action: '更新了 API方案 "官方 Anthropic"' },
    { time: '15分钟前', action: '添加了规则 "Python 编码规范"' },
    { time: '1小时前', action: '初始化了项目 "MyProject"' },
    { time: '2小时前', action: '同步配置到 Claude Code' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`w-2 h-2 rounded-full bg-${stat.color}`}></span>
            </div>
            <div className="text-2xl font-bold text-text">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 p-4 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-text mb-4">快捷操作</h2>
          <div className="grid grid-cols-4 gap-4">
            <button className="p-4 bg-bg-surface rounded-lg border border-border hover:border-primary/50 transition-colors text-center">
              <div className="text-2xl mb-2">➕</div>
              <div className="text-sm text-text-secondary">添加项目</div>
            </button>
            <button className="p-4 bg-bg-surface rounded-lg border border-border hover:border-primary/50 transition-colors text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm text-text-secondary">同步配置</div>
            </button>
            <button className="p-4 bg-bg-surface rounded-lg border border-border hover:border-primary/50 transition-colors text-center">
              <div className="text-2xl mb-2">➕</div>
              <div className="text-sm text-text-secondary">添加API方案</div>
            </button>
            <button className="p-4 bg-bg-surface rounded-lg border border-border hover:border-primary/50 transition-colors text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm text-text-secondary">导入片段</div>
            </button>
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-text mb-4">最近活动</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <div className="text-sm text-text-secondary">{activity.action}</div>
                  <div className="text-xs text-text-muted">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
