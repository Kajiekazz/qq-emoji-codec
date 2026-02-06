# QQ 表情编解码工具

将任意文本编码为 QQ 表情符号（拜谢/续标识），支持多种压缩算法，实现高效的文本传输。

## 功能特性

- **文本编码**：将任意文本转换为 QQ 表情符号
- **智能压缩**：自动选择最优压缩算法（Brotli / Zstd / 无压缩）
- **文本解码**：从 QQ 表情符号还原原始文本
- **跨平台兼容**：支持浏览器和 QQ 客户端复制粘贴
- **双端显示**：浏览器端显示表情图片，复制到剪贴板的是实际字符
- **主题切换**：支持亮色/暗色主题
- **移动端适配**：响应式设计，支持手机和平板

## 技术实现

### 编码原理

使用 Unicode 控制字符对作为二进制编码：
- `\u0014\u01A8` (续标识) = 二进制 `0`
- `\u0014\u0129` (拜谢) = 二进制 `1`

### 压缩格式头部

| 头部 | 压缩算法 | 说明 |
|------|----------|------|
| `0` | 无压缩 | 直接存储原始数据 |
| `10` | Brotli | 高速压缩，压缩率较高 |
| `11` | Zstandard | 高压缩率，速度快 |

### 压缩算法对比

| 算法 | 压缩率 | 速度 | 适用场景 |
|------|--------|------|----------|
| 无压缩 | 低 | 最快 | 短文本 |
| Brotli | 高 | 快 | 通用场景 |
| Zstd | 很高 | 较快 | 需要高压缩率 |

## 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器（Chrome/Edge/Firefox/Safari）

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npx vite
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

构建文件位于 `dist/` 目录

## 部署方式

### Vercel（推荐）

一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kajiekazz/qq-emoji-codec)

### Netlify

一键部署到 Netlify：

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Kajiekazz/qq-emoji-codec)

### 手动部署

将构建产物 `dist/` 上传到任何静态网站托管服务。

## 项目结构

```
qq-emoji-codec/
├── index.html              # 主页面
├── app.js                  # 核心逻辑（编码/解码/压缩）
├── vite.config.js          # Vite 构建配置
├── package.json            # 项目配置
├── netlify.toml            # Netlify 部署配置
├── public/
│   └── favicon.ico         # 网站图标
├── assets/
│   └── qq_emoji/          # QQ 表情图片资源
│       ├── 297/           # 续标识图片
│       └── 424/           # 拜谢图片
└── libs/
    └── brotli.js          # Brotli 压缩库
```

## 依赖说明

### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| @bokuweb/zstd-wasm | latest | Zstandard 压缩（浏览器 WASM） |
| brotli-wasm | latest | Brotli 压缩（浏览器 WASM） |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vite | latest | 构建工具 |

## 浏览器支持

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

需要支持以下特性：
- ES Modules
- WebAssembly
- SharedArrayBuffer（如需多线程）

## 工作原理

### 编码流程

```
输入文本 → UTF-8 编码 → 选择最优压缩 → 添加头部 → 转换为 QQ 表情
```

1. 用户输入任意文本
2. 文本转换为 UTF-8 字节
3. 并行尝试 Brotli 和 Zstd 压缩
4. 选择输出最短的压缩方式
5. 添加压缩类型头部
6. 二进制数据转换为 QQ 表情字符对

### 解码流程

```
QQ 表情 → 转换为二进制 → 解析头部 → 解压 → UTF-8 解码 → 原始文本
```

1. 粘贴 QQ 表情字符串
2. 识别字符对并转换为二进制
3. 解析压缩类型头部
4. 根据类型选择解压算法
5. 解压后还原为原始文本

## 常见问题

### Q: 为什么选择 QQ 表情而不是普通字符？

A: QQ 表情在 QQ 客户端中会以图片形式显示，视觉上更紧凑，且容易被识别为一条消息而非乱码。

### Q: 支持哪些文本编码？

A: 支持任意 UTF-8 编码的文本，包括中文、英文、Emoji、特殊符号等。

### Q: 压缩率如何？

A: 对于普通文本，Zstd 可达到 30-70% 的压缩率；Brotli 略低但速度更快。

### Q: 如何在 QQ 中复制？

A: 在网页上点击结果区域即可复制到剪贴板，直接粘贴到 QQ 发送即可。

## License

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
