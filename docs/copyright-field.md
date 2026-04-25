# copyright 字段配置说明

本项目的内容文件与目录元数据支持 `copyright` 字段。

可配置位置：
- 文章 frontmatter，例如 `src/content/blog/first-post.md`
- 目录 `_meta.yml`，例如 `src/content/blog/_meta.yml`

规则：
- `copyright` 整个字段是可选的
- 目录 `_meta.yml` 中的 `copyright` 会作为该目录下文章的默认值
- 单篇文章可以在 frontmatter 中重新声明 `copyright`，覆盖目录默认值

## 允许的配置

### 1. CC 协议

写法：

```yml
copyright:
  kind: cc
  license: cc-by-nc-sa-4.0
```

`license` 允许以下值：
- `cc0-1.0`
- `cc-by-4.0`
- `cc-by-sa-4.0`
- `cc-by-nd-4.0`
- `cc-by-nc-4.0`
- `cc-by-nc-sa-4.0`
- `cc-by-nc-nd-4.0`

### 2. 禁止转载

最简写法：

```yml
copyright:
  kind: no-repost
```

带自定义说明：

```yml
copyright:
  kind: no-repost
  statement: 未经许可不得转载、摘编或改编
```

`statement` 为可选字段；如果填写，必须是非空字符串。

## 示例

目录默认使用 CC 协议：

```yml
title: 文章
copyright:
  kind: cc
  license: cc-by-nc-sa-4.0
```

单篇文章覆盖为禁止转载：

```md
---
title: 示例文章
copyright:
  kind: no-repost
  statement: 未经作者书面许可，不得转载或改编
---
```

## 校验要点

以下情况会校验失败：
- `kind` 不是 `cc` 或 `no-repost`
- `kind: cc` 但缺少 `license`
- `license` 不是受支持的枚举值
- `kind: no-repost` 且 `statement` 为空字符串
