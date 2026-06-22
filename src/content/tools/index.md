---
title: 工具
rss: false
---

这里整理了本人制作的可在浏览器内运行的工具列表。

## 地铁相关工具

[@kyuri-metro](https://www.npmjs.com/org/kyuri-metro) 组织下的线路号方块、地贴、吊板贴纸等生成器，均可导出为 SVG / PNG / JPG / WebP。

### 上海地铁

#### [线路号方块生成器](https://kyuri-metro-storybook.umamichi.moe/)

根据实拍的 13 号线竖立线路图等（2020 样式 2）、9 号线站台门线路图（2020 样式）和 2 号线竖立线路图（2025 样式）制作的上海地铁线路号方块生成器，还原了上海地铁导向系统中几种典型的线路号方块样式。

NPM 包见[单独页面](/tools/shmetro-line-id-block-generator/)。

链接&示例：

- [2025](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2025-svg-generator--docs)

  <img src="/tools/imgs/shmetro-idblock/output-example-2025.webp" alt="上海地铁线路号方块生成器 2025 样式输出示例" style="max-height: 60px" />

- [2020](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2020-svg-generator--docs)

  <img src="/tools/imgs/shmetro-idblock/output-example.webp" alt="上海地铁线路号方块生成器 2020 样式输出示例" style="max-height: 60px" />

- [2020 样式 2](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-line-id-block-2020-type-2-svg-generator--docs)

  <img src="/tools/imgs/shmetro-idblock/output-example-2020-type2.webp" alt="上海地铁线路号方块生成器 2020 样式 2 输出示例" style="max-height: 60px" />

#### [数字线路号地贴生成器](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-shmetro-numeric-floor-sticker-2025-svg-generator--docs)

根据 2025 版《城市轨道交通导向标识系统设计规范（征求意见稿）》绘制的上海地铁数字线路号地贴（竖向箭头，显示线路号）SVG 生成器。

NPM：[@kyuri-metro/shmetro-numeric-floor-sticker-2025-svg-generator](https://www.npmjs.com/package/@kyuri-metro/shmetro-numeric-floor-sticker-2025-svg-generator)

GitHub：[kyuri-metro/shmetro-numeric-floor-sticker-2025-svg-generator](https://github.com/kyuri-metro/shmetro-numeric-floor-sticker-2025-svg-generator)

示例：

<img src="/tools/imgs/shmetro-numeric-floor-sticker/output-example.webp" alt="上海地铁数字线路号地贴生成器输出示例（12 号线）" style="max-height: 400px" />

### 南京地铁

#### [屏蔽门上方贴纸生成器（Beta）](https://njmetro-railmap-creator.umamichi.moe/)

根据实拍的南京地铁3号线吊板制作的南京地铁屏蔽门上方贴纸生成器。

GitHub：[kyuri-metro/njmetro-railmap-creator](https://github.com/kyuri-metro/njmetro-railmap-creator)

参考资料与推导草图见 [docs 目录](https://github.com/kyuri-metro/njmetro-railmap-creator/tree/main/docs)。

示例：

![南京地铁屏蔽门上方贴纸生成器线路牌示例](/tools/imgs/njmetro-railmap-creator/route-badge.webp)

![南京地铁屏蔽门上方贴纸生成器方向牌示例](/tools/imgs/njmetro-railmap-creator/direction-badge-long-station-name.webp)

![南京地铁屏蔽门上方贴纸生成器终点站牌示例](/tools/imgs/njmetro-railmap-creator/terminus-badge.webp)

#### [线路号方块生成器](https://kyuri-metro-storybook.umamichi.moe/?path=/docs/kyuri-metro-njmetro-line-id-block-svg-generator--docs)

参考实拍的南京地铁系统内导向标识图片制作的南京地铁线路号方块生成器，用于南京地铁屏蔽门上方贴纸生成器，也可单独使用。

NPM：[@kyuri-metro/njmetro-line-id-block-svg-generator](https://www.npmjs.com/package/@kyuri-metro/njmetro-line-id-block-svg-generator)

示例：

<img src="/tools/imgs/njmetro-idblock/output-example-v0.2.3.webp" alt="南京地铁线路号方块生成器输出示例" style="max-height: 120px" />

---

## Vibe Coding 的小作品

由 Vibe Coding 简单制作成的小作品。~~这并不是说其他章节的作品不是 Vibe Coding，但是本章的作品所花费的精力和注意力是小于其他章节的。~~

### [铁路缓和曲线交互实验](https://railroad-spline-experiment.umamichi.moe/)

一个用于观察“二点约束 + 两端切线 + 首尾允许补直线”时铁路曲线求解结果的交互式小实验，可选欧拉缓和曲线（美国常用）和三次抛物线缓和曲线（中国大陆常用），并实时查看补直线长度、缓和曲线长度、圆曲线长度、总长、转角和终点误差等参数。

GitHub：[Unnamed2964/kyuri-railroad-spline-experiment](https://github.com/Unnamed2964/kyuri-railroad-spline-experiment)

## 说明

这个页面会继续补充新的小工具。若某个工具失效或你有想法，请通过 GitHub 或邮箱 umamichi#outlook.com（将“#”替换为“@”）联系我。