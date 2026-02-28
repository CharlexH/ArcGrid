# ArcGrid Guide Lab 📐

[English](#english) | [中文](#中文)

---

![ArcGrid Preview](public/arcgrid_preview.webp)

## English

**ArcGrid** is a specialized web application prototype designed for generating manual-style logo construction guides. It automates the process of creating professional construction lines and geometric annotations for logo designs.

**✨ Live Demo:** [https://arcgrid.pages.dev/](https://arcgrid.pages.dev/)

### ✨ Key Features

- **Double-Track Input System**:
  - **SVG Direct Input**: Upload or paste SVG code to analyze existing vector shapes.
  - **AI Image Vectorization**: (Experimental) Convert raster images (PNG/JPG) to SVG using Gemini AI before running the construction analysis.
- **Intelligent Geometry Analysis**:
  - Automatically detects circles, arcs, and alignment lines to create "Candidate" construction guides.
  - **Robust SVG Processing**: Automatically handles stroke-to-fill conversions, preserves hollow effects, and ignores non-renderable `<defs>`.
- **Interactive Customization & Visualization**:
  - Toggle visibility for the logo, guides, and annotations.
  - **Adjustable Analysis Tolerance**: Fine-tune geometry detection sensitivity in real-time using the tolerance slider.
  - **Dynamic Growth Animation**: Visually engaging animated line-drawing effect during SVG rendering.
  - Adjust guide line colors and weights (Curve vs. Line) in real-time.
  - Switch between multiple analysis candidates to find the best geometric fit.
- **Professional Export**: Export your finalized construction guide as high-quality **SVG** or **PDF**.

### 🚀 Getting Started

#### Prerequisites

- Node.js (v18+)
- npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Optional, for Cloudflare deployment)

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ArcGrid

# Install dependencies
npm install
```

#### Running the App

```bash
# Start the development server (runs Tailwind CLI + Wrangler Pages dev)
npm run dev
```

The application will be available at `http://localhost:8788`.

### ⚙️ API Configuration

No environment variables are required. You can directly input your **Gemini API Key** within the settings panel on the webpage. The AI model is pre-configured to use **gemini-3.1-flash-image-preview**. Your API key will be securely saved in your browser's local storage.

*Note: The Gemini API is required for the experimental image-to-svg vectorization feature.*

### 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, Tailwind CSS, JavaScript (ES Modules).
- **Backend / Hosting**: Cloudflare Pages Functions (Hono.js).
- **AI Integration**: Google Gemini API for image analysis and vectorization.

---

![ArcGrid Preview](public/arcgrid_preview.webp)

## 中文

**ArcGrid** 是一个用于生成图标比例绘图和辅助线的原型应用。它能够自动为图标设计生成专业的辅助线、几何标注和制图规范。

**✨ 在线体验:** [https://arcgrid.pages.dev/](https://arcgrid.pages.dev/)

### ✨ 核心功能

- **双轨输入系统**:
  - **SVG 直接输入**: 支持上传或粘贴 SVG 代码，直接对现有矢量形状进行分析。
  - **AI 图像矢量化**: (实验性) 使用 Gemini AI 将位图 (PNG/JPG) 转换为 SVG，随后进入分析流程。
- **智能几何分析**:
  - 自动识别圆形、圆弧和对齐线，生成多种“候选”辅助线方案。
  - **强大的 SVG 处理**: 自动处理描边到填充的转换，保留镂空效果，并智能忽略 `<defs>` 等非渲染内容。
- **交互式自定义与可视化**:
  - 可动态切换 Logo 层、辅助线层和标注层的显示。
  - **动态容差调整**: 使用滑块实时微调几何特征检测的灵敏度。
  - **生动的生长动画**: 在渲染 SVG 时提供视觉上极具吸引力的线条动态绘制效果。
  - 实时调整辅助线的颜色和粗细（曲线 vs 直线）。
  - 在多个分析候选方案中切换，寻找最精准的几何匹配。
- **专业导出**: 支持将生成的制图规范导出为高质量的 **SVG** 或 **PDF** 格式。

### 🚀 快速上手

#### 环境准备

- Node.js (v18+)
- npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (可选，用于 Cloudflare 部署)

#### 安装步骤

```bash
# 克隆仓库
git clone <repository-url>
cd ArcGrid

# 安装依赖
npm install
```

#### 启动应用

```bash
# 启动开发服务器 (同时运行 Tailwind CLI 和 Wrangler Pages dev)
npm run dev
```

访问 `http://localhost:8788` 即可开始使用。

### ⚙️ API 配置

无需配置环境变量。您可以直接在网页的设置面板中输入您的 **Gemini API Key**，AI 模型已预选为 **gemini-3.1-flash-image-preview**。您的 API Key 将被被安全地保存在浏览器的本地存储 (Local Storage) 中。

*注意：Gemini API 仅在使用实验性的“图像转 SVG”功能时需要。*

### 🛠 技术栈

- **前端**: 原生 HTML5, Tailwind CSS, JavaScript (ES Modules)。
- **后端 / 部署**: Cloudflare Pages Functions (Hono.js)。
- **AI 集成**: 接入 Google Gemini API 进行图像分析与矢量化。

---

## 📄 License

MIT
