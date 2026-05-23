---
title: 工具
rss: false
---

这里整理了本人制作的可在浏览器内运行的工具列表。

## 地铁相关工具

与 [@kyuri-metro](https://www.npmjs.com/org/kyuri-metro) 组织下的线路号方块、屏蔽门贴纸等生成器有关。线路号方块的交互预览与导出已统一迁至 [kyuri-metro Storybook](https://kyuri-metro-storybook.umamichi.moe/)；原独立 UI 仓库（`njmetro-line-id-block-ui`、`shmetro-line-id-block-ui`）已归档。

### 上海地铁

#### [线路号方块生成器（Storybook）](https://kyuri-metro-storybook.umamichi.moe/)

参考实拍的 13 号线竖立线路图等（2020 样式 2）、9 号线站台门线路图（2020 样式）和 2 号线竖立线路图（2025 样式）制作。在 Storybook 中可调参数并导出 SVG / PNG / JPG / WebP。详细介绍、NPM 包与仓库说明见[单独页面](/tools/shmetro-line-id-block-generator/)。

| 样式 | Storybook |
| --- | --- |
| 2025 | [打开](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2025-svg-generator--docs) |
| 2020 | [打开](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2020-svg-generator--docs) |
| 2020 样式 2 | [打开](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2020-type-2-svg-generator--docs) |

示例：

- 2020 样式 2

  ![上海地铁线路号方块生成器 2020 样式 2 输出示例](/tools/shmetro-idblock/output-example-2020-type2.webp)

- 2020

  ![上海地铁线路号方块生成器 2020 样式输出示例](/tools/shmetro-idblock/output-example.webp)

- 2025

  ![上海地铁线路号方块生成器 2025 样式输出示例](/tools/shmetro-idblock/output-example-2025.webp)

### 南京地铁

#### [屏蔽门上方贴纸生成器（Beta）](https://njmetro-railmap-creator.umamichi.moe/)

用于生成南京地铁屏蔽门上方贴纸样式线路图，目前处于 Beta 阶段。

GitHub：[kyuri-metro/njmetro-railmap-creator](https://github.com/kyuri-metro/njmetro-railmap-creator)

参考资料与推导草图见 [docs 目录](https://github.com/kyuri-metro/njmetro-railmap-creator/tree/main/docs)。

示例：

![南京地铁屏蔽门上方贴纸生成器线路牌示例](/tools/njmetro-railmap-creator/route-badge.webp)

![南京地铁屏蔽门上方贴纸生成器方向牌示例](/tools/njmetro-railmap-creator/direction-badge.webp)

![南京地铁屏蔽门上方贴纸生成器终点站牌示例](/tools/njmetro-railmap-creator/terminus-badge.webp)

#### [线路号方块生成器（Storybook）](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-njmetro-line-id-block-svg-generator--docs)

参考实拍图片与其他资料制作的南京地铁线路号方块生成器。在 Storybook 中可调参数并导出 SVG / PNG / JPG / WebP。

NPM：[@kyuri-metro/njmetro-line-id-block-svg-generator](https://www.npmjs.com/package/@kyuri-metro/njmetro-line-id-block-svg-generator)

示例：

![南京地铁线路号方块生成器输出示例](/tools/njmetro-idblock/output-example-v0.2.3.webp)

---

## [铁路缓和曲线交互实验（未检查）](https://railroad-spline-experiment.umamichi.moe/)

一个用于观察“二点约束 + 两端切线 + 首尾允许补直线”时铁路曲线求解结果的交互式小实验，可在美国常用的欧拉缓和曲线和中国大陆常用的三次抛物线缓和曲线之间切换，并实时查看补直线长度、缓和曲线长度、圆曲线长度、总长、转角和终点误差。

这是一个未经检查的 vibe coding 产物，没有经过代码审查或测试覆盖，更适合作为可视化草图和几何玩具，而不是可靠工具。

GitHub：[Unnamed2964/kyuri-railroad-spline-experiment](https://github.com/Unnamed2964/kyuri-railroad-spline-experiment)

## 说明

这个页面会继续补充新的小工具。若某个工具失效或你有想法，请通过 GitHub 或邮箱 umamichi#outlook.com（将“#”替换为“@”）联系我。