# 《自动治愈花园》部署环境配置

## 概述
本文档提供《自动治愈花园》游戏的部署环境配置方案，涵盖Web服务器、小程序平台、监控系统、备份策略等。

## 部署架构

### 整体架构图
```
用户访问层
├── Web用户 → CDN → Web服务器 (静态文件)
├── 微信用户 → 微信小游戏平台
└── 抖音用户 → 抖音小游戏平台

应用服务层
├── 游戏客户端 (Cocos Creator构建产物)
├── REST API服务器 (Node.js + Express)
└── 实时通信服务器 (Socket.IO)

数据存储层
├── MongoDB (游戏数据、用户数据)
├── Redis (缓存、会话)
└── 对象存储 (图片、资源文件)

运维支撑层
├── 监控系统 (性能、错误、业务)
├── 日志系统 (访问日志、错误日志)
└── 备份系统 (数据备份、文件备份)
```

## 部署方案

### 方案一：简单部署（推荐起步）

#### 1. Web静态文件部署
```bash
# 部署目标：静态文件服务器
# 适用场景：快速验证、测试环境

# 步骤：
1. 构建Web平台产物
   node build/scripts/build.js web
   或 npm run build:web

2. 上传构建产物到Web服务器
   # 构建产物位置：dist/web/
   # 上传到：/var/www/auto-healing-garden/

3. 配置Web服务器（Nginx示例）
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/auto-healing-garden;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 启用gzip压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
   }
```

#### 2. 微信小游戏部署
```bash
# 部署目标：微信小游戏平台
# 前提条件：已注册微信小程序，获取AppID

# 步骤：
1. 构建微信小游戏产物
   node build/scripts/build.js wechat
   或 npm run build:wechat

2. 使用微信开发者工具
   - 打开微信开发者工具
   - 导入项目：dist/wechat/
   - 配置AppID、项目设置
   - 上传代码到微信平台

3. 提交审核和发布
   - 在微信公众平台提交审核
   - 审核通过后发布上线
```

#### 3. 抖音小游戏部署
```bash
# 部署目标：抖音小游戏平台
# 前提条件：已注册抖音小程序，获取AppID

# 步骤：
1. 构建抖音小游戏产物
   node build/scripts/build.js douyin
   或 npm run build:douyin

2. 使用抖音开发者工具
   - 打开抖音开发者工具
   - 导入项目：dist/douyin/
   - 配置AppID、项目设置
   - 上传代码到抖音平台

3. 提交审核和发布
   - 在抖音开放平台提交审核
   - 审核通过后发布上线
```

### 方案二：完整部署（生产环境）

#### 1. 服务器环境配置

##### 服务器规格建议
```yaml
最低配置（测试/小型项目）:
  CPU: 2核
  内存: 4GB
  存储: 40GB SSD
  带宽: 5Mbps

推荐配置（生产环境）:
  CPU: 4核
  内存: 8GB
  存储: 100GB SSD
  带宽: 10Mbps
  备份存储: 200GB
```

##### 操作系统和软件
```bash
# Ubuntu 22.04 LTS 示例
# 安装必需软件
sudo apt update
sudo apt install -y nginx nodejs npm mongodb redis-server
sudo npm install -g pm2

# 验证安装
node --version  # v18.x.x
mongod --version
redis-server --version
```

#### 2. 域名和SSL配置

##### 域名配置
```bash
# DNS记录配置示例
# A记录：your-domain.com → 服务器IP
# CNAME记录：www.your-domain.com → your-domain.com
# 子域名：api.your-domain.com → 服务器IP（API服务器）
```

##### SSL证书配置
```bash
# 使用Let's Encrypt免费SSL证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期配置
sudo certbot renew --dry-run
```

#### 3. Nginx完整配置

##### 主站点配置
```nginx
# /etc/nginx/sites-available/auto-healing-garden
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 根目录
    root /var/www/auto-healing-garden;
    index index.html;
    
    # 静态文件服务
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API代理（如果启用服务端）
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket代理（如果启用实时通信）
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

##### 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/auto-healing-garden /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. 服务端部署（如果启用）

##### 环境配置
```bash
# 创建服务端目录
mkdir -p /opt/auto-healing-garden/server
cd /opt/auto-healing-garden/server

# 复制服务端文件
cp -r /path/to/project/server/* .

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库连接等
```

##### PM2进程管理
```bash
# 安装PM2
sudo npm install -g pm2

# 启动服务
pm2 start app.js --name "auto-healing-garden-server"

# 设置开机自启
pm2 startup
pm2 save

# 监控日志
pm2 logs auto-healing-garden-server
```

#### 5. 数据库部署

##### MongoDB配置
```bash
# 安装MongoDB
sudo apt install -y mongodb

# 启动MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 创建数据库和用户
mongo
> use auto_healing_garden
> db.createUser({
    user: "game_admin",
    pwd: "secure_password",
    roles: ["readWrite", "dbAdmin"]
  })
```

##### Redis配置
```bash
# 安装Redis
sudo apt install -y redis-server

# 配置Redis
sudo nano /etc/redis/redis.conf
# 修改：bind 127.0.0.1 → bind 0.0.0.0（如果需要远程访问）
# 设置密码：requirepass your_redis_password

# 重启Redis
sudo systemctl restart redis
```

## 监控和运维

### 1. 基础监控

#### 服务器监控
```bash
# 安装基础监控工具
sudo apt install -y htop iotop iftop nethogs

# 使用系统监控
# 查看CPU使用: top 或 htop
# 查看内存: free -h
# 查看磁盘: df -h
# 查看网络: iftop
```

#### 应用监控
```bash
# PM2监控
pm2 monit

# 查看应用日志
pm2 logs auto-healing-garden-server

# 查看Web服务器日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 高级监控（可选）

#### 使用Prometheus + Grafana
```bash
# 安装Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# 配置Prometheus
# 编辑prometheus.yml，添加Node Exporter和Nginx Exporter

# 安装Grafana
sudo apt install -y grafana
sudo systemctl start grafana-server
```

#### 业务监控指标
```yaml
关键业务指标:
  - 游戏启动次数
  - 用户活跃度
  - 广告展示和点击
  - 用户留存率
  - 错误率
```

### 3. 日志管理

#### 日志配置
```bash
# 配置日志轮转
sudo nano /etc/logrotate.d/auto-healing-garden

# 日志轮转配置示例
/var/log/auto-healing-garden/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
```

#### 日志收集（可选）
```bash
# 使用ELK Stack（Elasticsearch, Logstash, Kibana）
# 或使用云服务：AWS CloudWatch, Google Cloud Logging
```

## 备份和恢复

### 1. 数据备份策略

#### 数据库备份
```bash
# MongoDB备份脚本
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --out $BACKUP_DIR/$DATE

# 添加到cron定时任务
# 每天凌晨2点执行备份
0 2 * * * /path/to/mongodb-backup.sh
```

#### 文件备份
```bash
# 游戏文件备份
#!/bin/bash
BACKUP_DIR="/backup/files"
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf $BACKUP_DIR/game-files-$DATE.tar.gz /var/www/auto-healing-garden
```

### 2. 恢复流程

#### 数据库恢复
```bash
# 从备份恢复MongoDB
mongorestore --drop /backup/mongodb/20240101_020000/
```

#### 文件恢复
```bash
# 从备份恢复游戏文件
tar -xzf /backup/files/game-files-20240101.tar.gz -C /
```

## 安全配置

### 1. 服务器安全
```bash
# 防火墙配置
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# SSH安全
sudo nano /etc/ssh/sshd_config
# 修改：Port 2222（非标准端口）
# 修改：PasswordAuthentication no（禁用密码登录）
# 修改：PermitRootLogin no（禁用root登录）
```

### 2. 应用安全
```yaml
安全头配置（已在Nginx配置中）:
  - X-Frame-Options: 防止点击劫持
  - X-Content-Type-Options: 防止MIME类型嗅探
  - X-XSS-Protection: 防止XSS攻击
  - Content-Security-Policy: 内容安全策略
```

### 3. 数据安全
```bash
# 数据库加密连接
# MongoDB启用TLS
# Redis启用SSL

# 敏感信息保护
# 使用环境变量，不在代码中硬编码密钥
# 定期更换密钥和密码
```

## 性能优化

### 1. CDN配置
```bash
# 使用CDN加速静态资源
# 推荐CDN服务：Cloudflare, AWS CloudFront, 阿里云CDN

# 配置步骤：
1. 注册CDN服务
2. 添加域名 your-domain.com
3. 配置源站为你的服务器IP
4. 配置缓存规则
5. 更新DNS记录指向CDN
```

### 2. 缓存优化
```nginx
# Nginx缓存配置
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API响应缓存
location /api/static/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
}
```

### 3. 图片和资源优化
```bash
# 图片压缩
# 使用工具：ImageOptim, TinyPNG
# 格式选择：WebP > JPEG > PNG

# 代码压缩
# 构建时启用代码压缩和混淆
# 资源合并和分包加载
```

## 上线检查清单

### 技术检查
- [ ] 三级验收报告齐全且通过
- [ ] 构建测试全部通过（27项）
- [ ] 部署环境配置完成
- [ ] 域名和SSL证书配置
- [ ] 监控系统就绪
- [ ] 备份策略就绪

### 业务检查
- [ ] 游戏内容符合平台规范
- [ ] 广告配置正确（如使用）
- [ ] 支付功能测试通过（如使用）
- [ ] 用户隐私政策明确

### 运维检查
- [ ] 服务器性能监控就绪
- [ ] 错误监控和告警就绪
- [ ] 日志收集和分析就绪
- [ ] 应急响应流程就绪

## 应急响应

### 常见问题处理

#### 1. 服务器宕机
```bash
# 应急步骤：
1. 检查服务器状态：ping, ssh
2. 查看系统日志：/var/log/syslog
3. 检查资源使用：top, df, free
4. 重启服务：sudo systemctl restart nginx
5. 如果无法恢复，切换到备份服务器
```

#### 2. 数据库故障
```bash
# 应急步骤：
1. 检查MongoDB状态：sudo systemctl status mongodb
2. 查看MongoDB日志：/var/log/mongodb/mongod.log
3. 尝试重启：sudo systemctl restart mongodb
4. 如果数据损坏，从备份恢复
```

#### 3. 应用错误
```bash
# 应急步骤：
1. 查看应用日志：pm2 logs
2. 检查错误频率和影响范围
3. 临时回滚到上一个稳定版本
4. 修复问题后重新部署
```

## 联系方式

### 技术支持
- **服务器问题**: 系统管理员
- **应用问题**: 开发团队
- **监控告警**: 运维团队

### 文档维护
- **部署文档**: 本文档
- **构建文档**: `BUILD_OPERATION_MANUAL.md`
- **项目总结**: `PROJECT_SUMMARY.md`

---

**文档版本**: v1.0.0  
**最后更新**: 2026-04-07  
**验证状态**: ✅ 基于三级验收通过的项目架构  
**部署就绪**: ✅ 提供完整部署方案和检查清单