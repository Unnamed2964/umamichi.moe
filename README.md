# umamichi.moe

[![Astro](https://img.shields.io/badge/Astro-6.1.3-111111?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)](https://react.dev)
[![Chakra%20UI](https://img.shields.io/badge/Chakra%20UI-3.34-1a202c?logo=chakraui&logoColor=4fd1c5)](https://chakra-ui.com)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-f38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-43853d?logo=nodedotjs&logoColor=white)](https://nodejs.org)

> 以下内容为 GPT 5.4 生成，但已经过人工检查，可以作为参考。

这是 umamichi.moe 的站点仓库。

## 项目概览

- 站点框架：Astro
- UI 组件：React + Chakra UI
- 内容来源：src/content 下的 Markdown 和 MDX
- 部署目标：Cloudflare Workers / Pages 兼容运行时
- 线上地址：https://umamichi.moe

## 本地开发

要求：Node.js 22.12.0 或更高版本。

```sh
npm install
npm run dev
```

默认开发服务器由 Astro 启动。

## 常用命令

```sh
npm run dev
npm run build
npm run preview
npm run deploy
```

- `npm run dev`：启动本地开发服务器
- `npm run build`：构建站点到 dist
- `npm run preview`：构建后通过 Wrangler 进行本地预览
- `npm run deploy`：构建并部署到 Cloudflare

## 仓库结构

- `src/`：页面、组件、内容配置和运行时代码
- `src/content/`：站点内容
- `public/`：静态资源
- `functions/`：Cloudflare 相关函数代码
- `docs/`：项目内部说明文档