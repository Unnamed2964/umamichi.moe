---
title: 工具
rss: false
---

这里整理了本人制作的可在浏览器内运行的工具列表。

## [上海地铁线路号方块生成器](https://shmetro-line-id-block-generator-v2.umamichi.moe)

参考实拍的13号线竖立线路图等（2020样式2）、9号线站台门线路图（2020样式）、和2号线竖立线路图（2025样式）制作的上海地铁线路号方块生成器。详细介绍、相关仓库与 NPM 包见[单独页面](/tools/shmetro-line-id-block-generator/)。

示例：

- 2020样式2

  ![上海地铁线路号方块生成器2020样式2输出示例](/tools/shmetro-idblock/output-example-2020-type2.webp)

- 2020

  ![上海地铁线路号方块生成器2020样式输出示例](/tools/shmetro-idblock/output-example.webp)

- 2025

  ![上海地铁线路号方块生成器2025样式输出示例](/tools/shmetro-idblock/output-example-2025.webp)

## [南京地铁屏蔽门上方贴纸生成器（Alpha）](https://njmetro-railmap-creator.umamichi.moe/)

用于生成南京地铁屏蔽门上方贴纸样式线路图的工具，目前仍处于 Alpha 阶段。

GitHub 仓库链接：[Unnamed2964/njmetro-railmap-creator](https://github.com/Unnamed2964/njmetro-railmap-creator)

参考资料与推导草图见 [docs 目录](https://github.com/Unnamed2964/njmetro-railmap-creator/tree/main/docs)，其中整理了参考照片、草图、SVG 原型和文字压缩相关推导。

示例：

![南京地铁屏蔽门上方贴纸生成器线路牌示例](/tools/njmetro-railmap-creator/route-badge.webp)

![南京地铁屏蔽门上方贴纸生成器方向牌示例](/tools/njmetro-railmap-creator/direction-badge.webp)

![南京地铁屏蔽门上方贴纸生成器终点站牌示例](/tools/njmetro-railmap-creator/terminus-badge.webp)

## [铁路缓和曲线交互实验（未检查）](https://railroad-spline-experiment.umamichi.moe/)

一个用于观察“二点约束 + 两端切线 + 首尾允许补直线”时铁路曲线求解结果的交互式小实验，可在美国常用的欧拉缓和曲线和中国大陆常用的三次抛物线缓和曲线之间切换，并实时查看补直线长度、缓和曲线长度、圆曲线长度、总长、转角和终点误差。

这是一个未经检查的 vibe coding 产物，没有经过代码审查或测试覆盖，更适合作为可视化草图和几何玩具，而不是可靠工具。

GitHub 仓库链接：[Unnamed2964/kyuri-railroad-spline-experiment](https://github.com/Unnamed2964/kyuri-railroad-spline-experiment)

## 说明

这个页面会继续补充新的小工具。若某个工具失效或你有想法，请通过 GitHub 或邮箱 umamichi#outlook.com（将“#”替换为“@”）联系我。