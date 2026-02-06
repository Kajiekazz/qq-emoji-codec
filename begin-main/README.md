# ✨ Kajie's Space (Etheria Portal)

> 一个高颜值的二次元风格个人导航页/起始页，采用 React + Tailwind CSS 构建，包含玻璃拟态设计、音乐播放器和隐藏的互动小游戏。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)

## 🖼️ 预览 | Preview

*(此处建议您上传一张截图放在这里)*

## 🌟 特性 | Features

*   **🎨 极致美学**: 深度定制的玻璃拟态 (Glassmorphism) UI，配合平滑的弹簧动画 (Spring Animation)。
*   **🌗 日夜模式**: 支持明亮/暗黑模式切换，自动适配背景与UI色调。
*   **🌸 沉浸体验**: 樱花飘落特效、自定义跟随光标、呼吸感交互动画。
*   **🎵 音乐播放器**: 内置悬浮式音乐播放器，支持播放列表、最小化和后台播放。
*   **🎮 隐藏彩蛋**:
    *   **Pixel Garden**: 一个像素风格的跳跃收集小游戏（在个人卡片点击手柄图标进入）。
    *   **Destroyer Mode**: 一个可以在页面上驾驶飞机并“摧毁”网页元素的解压模式（在设置菜单中开启）。
*   **📱 响应式设计**: 完美适配桌面端与移动端访问。
*   **🔧 易于配置**: 通过配置文件轻松修改链接、个人信息和歌单。

## 🚀 快速开始 | Getting Started

### 环境要求
*   Node.js 16+
*   npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/kajies-space.git

# 进入目录
cd kajies-space

# 安装依赖
npm install
```

### 运行开发服务器

```bash
npm run dev
# 或
npm start
```

打开浏览器访问 `http://localhost:3000` (或控制台提示的端口)。

## ⚙️ 配置指南 | Configuration

本项目的所有内容均可通过代码配置，无需修改复杂的逻辑。

### 1. 修改个人信息与链接
打开 `src/constants.ts` 文件，你可以修改以下内容：
*   **APP_NAME / USER_NAME**: 网站标题与你的名字。
*   **PROFILE**: 头像、简介、标签、Email 等。
*   **LINKS**: 导航链接列表（支持分类、图标、颜色配置）。
*   **BACKGROUND_IMAGE**: 背景图片 URL。

```typescript
// 示例：src/constants.ts
export const PROFILE = {
  name: "你的名字",
  bio: "你的个性签名",
  // ...
};
```

### 2. 修改音乐列表
打开 `src/playlist.ts` 文件，在 `PLAYLIST_DATA` 数组中添加或删除歌曲：

```typescript
// 示例：src/playlist.ts
export const PLAYLIST_DATA: Song[] = [
  {
    title: "歌曲名",
    artist: "歌手",
    url: "歌曲直链地址 (mp3/mp4)"
  },
  // ...
];
```

## 🛠️ 技术栈 | Tech Stack

*   **React**: 用于构建用户界面的 JavaScript 库。
*   **Tailwind CSS**: 原子化 CSS 框架，实现快速样式开发。
*   **Lucide React**: 现代化的图标库。
*   **Web Audio API**: 用于实现游戏音效和飞机模式的音频反馈。

## 🤝 贡献 | Contribution

欢迎提交 Issue 或 Pull Request 来改进这个项目！

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

## 📄 协议 | License

MIT License © 2024 Kajie
