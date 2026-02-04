# QQ 表情编解码工具

将文本编码为 QQ 表情符号（拜谢/续标识），支持多种压缩算法。

## 功能

- **文本编码**：将任意文本转换为 QQ 表情符号
- **智能压缩**：自动选择最优压缩算法（Brotli / LZMA / Deflate / 无压缩）
- **文本解码**：从 QQ 表情符号还原原始文本
- **跨平台**：支持浏览器和 QQ 客户端复制粘贴

## 技术细节

- 使用 Unicode 控制字符对作为二进制编码：
  - `\u0014\u01A8` (续标识) = 0
  - `\u0014\u0129` (拜谢) = 1
- 压缩格式头部标记：
  - `0` - 无压缩
  - `10` - Brotli
  - `11` - LZMA
  - `110` - Deflate

## 一键部署

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kajiekazz/qq-emoji-codec)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Kajiekazz/qq-emoji-codec)

## 本地运行

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后访问 http://localhost:8080

## 文件结构

```
.
├── index.html          # 主页面
├── app.js              # 核心逻辑
├── netlify.toml        # Netlify 配置
├── assets/
│   └── qq_emoji/       # QQ 表情图片资源
└── libs/
    ├── pako.min.js     # Deflate 压缩库
    ├── brotli.js       # Brotli 压缩库
    └── lzma-browser.js # LZMA 压缩库
```

## 浏览器支持

- Chrome / Edge / Firefox / Safari 最新版本
- 支持移动端浏览器

## License

MIT
