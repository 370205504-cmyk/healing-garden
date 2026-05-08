# 《自动治愈花园》监控系统部署指南

## 概述
本文档提供《自动治愈花园》游戏监控系统的完整部署指南，包括Prometheus、Grafana、告警等组件的安装和配置。

## 监控架构

### 组件清单
1. **数据收集层**
   - Node Exporter: 服务器资源监控
   - MongoDB Exporter: 数据库监控
   - Redis Exporter: 缓存监控
   - Blackbox Exporter: 外部可用性监控
   - 应用指标: Node.js应用自定义指标

2. **数据存储和查询层**
   - Prometheus: 时间序列数据库
   - Thanos (可选): 长期存储和全局查询

3. **可视化层**
   - Grafana: 监控仪表板和可视化

4. **告警层**
   - Alertmanager: 告警路由和管理
   - 通知渠道: 邮件、Slack、微信、短信

5. **日志层**
   - Loki: 日志收集和查询
   - Promtail: 日志收集代理

## 部署步骤

### 第一步：服务器资源监控（Node Exporter）
```bash
# 在每个服务器上安装Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.0.linux-amd64.tar.gz
cd node_exporter-1.6.0.linux-amd64

# 创建systemd服务
sudo cp node_exporter /usr/local/bin/
sudo useradd -rs /bin/false node_exporter

sudo tee /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### 第二步：数据库监控
#### MongoDB监控
```bash
# 安装MongoDB Exporter
wget https://github.com/percona/mongodb_exporter/releases/download/v0.39.0/mongodb_exporter-0.39.0.linux-amd64.tar.gz
tar xvfz mongodb_exporter-0.39.0.linux-amd64.tar.gz
cd mongodb_exporter-0.39.0.linux-amd64

# 配置环境变量
export MONGODB_URI="mongodb://admin:password@localhost:27017"
export WEB_LISTEN_ADDRESS=":9216"

# 启动
./mongodb_exporter
```

#### Redis监控
```bash
# 安装Redis Exporter
wget https://github.com/oliver006/redis_exporter/releases/download/v1.54.0/redis_exporter-v1.54.0.linux-amd64.tar.gz
tar xvfz redis_exporter-v1.54.0.linux-amd64.tar.gz
cd redis_exporter-v1.54.0.linux-amd64

# 启动
./redis_exporter -redis.addr redis://localhost:6379 -web.listen-address :9121
```

### 第三步：应用指标收集
#### 在Node.js应用中添加Prometheus指标
```bash
# 安装依赖
cd server
npm install prom-client express-prom-bundle
```

#### 创建指标收集中间件
```javascript
// server/middleware/metrics.js
const promBundle = require('express-prom-bundle');
const client = require('prom-client');

// 创建指标收集中间件
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'auto_healing_garden' },
  promClient: {
    collectDefaultMetrics: {
      timeout: 5000
    }
  }
});

// 自定义业务指标
const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total user registrations',
  labelNames: ['platform']
});

const activeSessions = new client.Gauge({
  name: 'user_sessions_active',
  help: 'Number of active user sessions'
});

const adRevenue = new client.Counter({
  name: 'ad_revenue_total',
  help: 'Total ad revenue',
  labelNames: ['platform', 'ad_type']
});

module.exports = {
  metricsMiddleware,
  userRegistrations,
  activeSessions,
  adRevenue
};
```

### 第四步：Prometheus部署
```bash
# 下载Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.0/prometheus-2.47.0.linux-amd64.tar.gz
tar xvfz prometheus-2.47.0.linux-amd64.tar.gz
cd prometheus-2.47.0.linux-amd64

# 复制配置文件
cp ../../deploy/monitoring/prometheus.yml .
cp ../../deploy/monitoring/alerts.yml .

# 启动Prometheus
./prometheus --config.file=prometheus.yml --web.listen-address=":9090"
```

### 第五步：Grafana部署
```bash
# 添加Grafana仓库
sudo apt-get install -y software-properties-common wget
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# 安装Grafana
sudo apt-get update
sudo apt-get install -y grafana

# 启动Grafana
sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

#### 导入仪表板
1. 访问Grafana: http://your-server:3000
2. 默认账号: admin/admin
3. 添加数据源: Prometheus (http://localhost:9090)
4. 导入仪表板: 使用`deploy/monitoring/grafana-dashboard.json`

### 第六步：Alertmanager部署
```bash
# 下载Alertmanager
wget https://github.com/prometheus/alertmanager/releases/download/v0.25.0/alertmanager-0.25.0.linux-amd64.tar.gz
tar xvfz alertmanager-0.25.0.linux-amd64.tar.gz
cd alertmanager-0.25.0.linux-amd64

# 创建配置文件
tee alertmanager.yml <<EOF
global:
  smtp_smarthost: 'smtp.yourdomain.com:587'
  smtp_from: 'alerts@autohealinggarden.com'
  smtp_auth_username: 'alerts@yourdomain.com'
  smtp_auth_password: 'your_password'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'team-email'

  routes:
  - match:
      severity: critical
    receiver: 'team-pager'
    continue: true
  - match:
      severity: warning
    receiver: 'team-slack'

receivers:
- name: 'team-email'
  email_configs:
  - to: 'devops@yourdomain.com'
    send_resolved: true

- name: 'team-pager'
  webhook_configs:
  - url: 'http://pagerduty-webhook.yourdomain.com'
    send_resolved: true

- name: 'team-slack'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'
    channel: '#alerts'
    send_resolved: true
EOF

# 启动Alertmanager
./alertmanager --config.file=alertmanager.yml
```

### 第七步：日志监控（可选）
```bash
# 使用Loki进行日志监控
# 参考: https://grafana.com/docs/loki/latest/installation/
```

## 监控指标说明

### 服务器资源指标
- CPU使用率: `node_cpu_seconds_total`
- 内存使用: `node_memory_*`
- 磁盘使用: `node_filesystem_*`
- 网络流量: `node_network_*`

### 应用指标
- HTTP请求: `http_requests_total`
- 响应时间: `http_request_duration_seconds`
- 活跃会话: `user_sessions_active`
- 用户注册: `user_registrations_total`
- 广告收入: `ad_revenue_total`

### 数据库指标
- MongoDB连接: `mongodb_connections_*`
- Redis内存: `redis_memory_*`
- 查询性能: `mongodb_operations_total`, `redis_commands_processed_total`

## 告警配置

### 告警渠道
1. **邮件告警**: 所有告警级别
2. **Slack通知**: 警告级别告警
3. **PagerDuty**: 严重级别告警（需要立即处理）
4. **微信通知**: 业务指标告警（可选）

### 告警阈值
- **警告级别**: 需要关注，但不需要立即处理
- **严重级别**: 需要立即处理，可能影响服务

## 维护和优化

### 日常维护
1. **每天检查**: 查看告警状态和关键指标
2. **每周检查**: 分析趋势和容量规划
3. **每月检查**: 优化告警阈值和仪表板

### 性能优化
1. **指标精简**: 只收集必要的指标
2. **采样频率**: 根据需求调整采集频率
3. **数据保留**: 设置合理的数据保留策略

## 故障排除

### 常见问题
1. **指标无法收集**: 检查Exporter状态和网络连接
2. **告警不触发**: 检查Prometheus规则和Alertmanager配置
3. **仪表板无法加载**: 检查Grafana数据源和面板配置

### 调试命令
```bash
# 检查Prometheus目标状态
curl http://localhost:9090/api/v1/targets

# 检查指标是否存在
curl "http://localhost:9090/api/v1/query?query=up"

# 检查告警规则
curl http://localhost:9090/api/v1/rules

# 检查Alertmanager状态
curl http://localhost:9093/api/v2/status
```

## 安全考虑
1. **访问控制**: 限制监控系统的访问权限
2. **数据加密**: 使用HTTPS访问监控界面
3. **认证授权**: 启用Grafana和Prometheus认证
4. **网络隔离**: 监控系统应在独立网络区域

## 备份和恢复
1. **配置备份**: 定期备份Prometheus、Grafana、Alertmanager配置
2. **仪表板备份**: 定期导出Grafana仪表板
3. **数据备份**: 如果使用Thanos，配置长期存储备份