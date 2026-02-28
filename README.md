# ArcGrid VI Guide Lab 📐

[English](#english) | [中文](#中文)

---

## English

**ArcGrid** is a specialized web application prototype designed for generating VI (Visual Identity) manual-style logo construction guides. It automates the process of creating professional construction lines and geometric annotations for logo designs.

### ✨ Key Features

- **Double-Track Input System**:
  - **SVG Direct Input**: Upload or paste SVG code to analyze existing vector shapes.
  - **AI Image Vectorization**: (Experimental) Convert raster images (PNG/JPG) to SVG using Gemini AI before running the construction analysis.
- **Intelligent Geometry Analysis**: Automatically detects circles, arcs, and alignment lines to create "Candidate" construction guides.
- **Interactive Customization**:
  - Toggle visibility for the logo, guides, and annotations.
  - Adjust guide line colors and weights (Curve vs. Line) in real-time.
  - Switch between multiple analysis candidates to find the best geometric fit.
- **Professional Export**: Export your finalized construction guide as high-quality **SVG** or **PDF**.

### 🚀 Getting Started

#### Prerequisites

- Node.js (v18+)
- npm

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
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in the required fields:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.1-flash-image-preview
```

*Note: The Gemini API is required for the experimental image-to-svg vectorization feature.*

### 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism Design), JavaScript (ES Modules).
- **Backend**: Node.js, Express.
- **AI Integration**: Google Gemini API for image analysis and vectorization.

---

## 中文

**ArcGrid** 是一个用于生成 VI（视觉识别系统）手册风格 Logo 比例绘图和辅助线的原型应用。它能够自动为 Logo 设计生成专业的辅助线、几何标注和制图规范。

### ✨ 核心功能

- **双轨输入系统**:
  - **SVG 直接输入**: 支持上传或粘贴 SVG 代码，直接对现有矢量形状进行分析。
  - **AI 图像矢量化**: (实验性) 使用 Gemini AI 将位图 (PNG/JPG) 转换为 SVG，随后进入分析流程。
- **智能几何分析**: 自动识别圆形、圆弧和对齐线，生成多种“候选”辅助线方案。
- **交互式自定义**:
  - 可动态切换 Logo 层、辅助线层和标注层的显示。
  - 实时调整辅助线的颜色和粗细（曲线 vs 直线）。
  - 在多个分析候选方案中切换，寻找最精准的几何匹配。
- **专业导出**: 支持将生成的制图规范导出为高质量的 **SVG** 或 **PDF** 格式。

### 🚀 快速上手

#### 环境准备

- Node.js (v18+)
- npm

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
# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可开始使用。

### ⚙️ 环境配置

将 `.env.example` 复制为 `.env` 并填写相关信息：

```env
GEMINI_API_KEY=你的API密钥
GEMINI_MODEL=gemini-3.1-flash-image-preview
```

*注意：Gemini API 仅在使用实验性的“图像转 SVG”功能时需要。*

### 🛠 技术栈

- **前端**: 原生 HTML5, CSS3 (现代毛玻璃设计风格), JavaScript (ES Modules)。
- **后端**: Node.js, Express。
- **AI 集成**: 接入 Google Gemini API 进行图像分析与矢量化。

---

## 📄 License

MIT
