---
title: '博客仍在建设中'
tags: ['示例', '排版']
pubDate: '2026-04-06'
---

# h1

## h2

### h3

#### h4

##### h5

###### h6

正文

博客仍在建设中。

> （以下为排版示例文本）

为此改造必须找到一个解决方案，解决上述问题。另外，从长远方面考虑，由于硬件和操作系统发展日新月异，未来还将面临硬件更新以及操作系统版本陈旧的问题，还需要进一步确保在将来更新升级硬件和操作系统的可行性。

为了解决上述一系列问题，最终形成了应用虚拟机技术的改造方案。将牵引供电监控系统升级成新软件版本（诊断系统软件仍采用旧版本），并在虚拟计算机环境中运行而不依赖于将来硬件的变化，这样，在未来系统可以很容易地升级硬件版本。并且，那些没有升级新版本的系统软件或在新操作系统下无许可的其它系统软件，也可以在虚拟计算机环境中旧的操作系统下运行使用。

**GitHub**: [Unnamed2964 的 GitHub 主页](https://github.com/Unnamed2964)

## MathJax 测试

$\cfrac{2}{\cfrac{1}{a} + \cfrac{1}{b}} \leq \sqrt{ab} \leq \cfrac{a + b}{2} \leq \sqrt{\cfrac{a^2+b^2}{2}}$

$$
I_3 = 
\begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1
\end{bmatrix}
$$

## 引用测试

> 实现铁路**“跨越式”**发展！

## 代码块测试

```c++
// 示例代码
int sum = 0;
for (int i = 0; i < 100; i++) {
    if (i % 2 == 0)
        sum += i;
    else
        sum += i * i;
}
std::cout << sum << std::endl;
```

```coq
(* some trivial proof *)

Inductive Odd : nat -> Type :=
  | odd_1: Odd 1
  | odd_S_S_n: forall (n : nat), Odd n -> Odd (S (S n)).

Example zero_is_not_odd : Odd 0 -> False.
Proof.
  intro H. inversion H. Qed.
```

```powershell
# 一段来自网络的示例 PowerShell 脚本

$global:Threshold = 80

function Check-CPU {
    $usage = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples[0].CookedValue
    if ($usage -gt $global:Threshold) {
        Write-Output "CPU 使用率过高：$([math]::Round($usage, 2))%"
    } else {
        Write-Output "CPU 使用率正常：$([math]::Round($usage, 2))%"
    }
}
```

## Utau 角色对比

|        | 重音テト | 呗音ウタ     | 桃音モモ                                     | 足立レイ   |
| ------ | -------- | ------------ | -------------------------------------------- | ---------- |
| 生日   | 4.1      | 2.5/3.6      | 5.22                                         | 1.1        |
| 物种   | 奇美拉   | 人类         | 机器人                                       | 机器人     |
| 性格   | 傲娇     | 无口         | 温柔                                         | 笨蛋       |
| 代表物 | 法棍     | 火箭推进榴弹 | 扫帚、鸡毛掸子等清洁工具、锅和勺子等做菜工具 | 炸鸡和橘子 |

## 运转日程

- 从曹路乘坐9号线前往世纪大道
- 在世纪大道换乘6号线前往高科西路
- 在高科西路换乘7号线[^1]前往东安路
- 在东安路换乘4号线前往中山公园
- 在中山公园换乘2号线前往江苏路

## 今日计划

- [x] 乘坐申崇二线
- [ ] 到达南通

## 关于重音テト的一些有趣事实

1. 重音テト是奇美拉，可以变形成任何形状；
2. 重音テト善于言辞[^2]；
3. 重音テト可以寄居于地球的任何角落；
4. 足立レイ是**バカ**[^3]，重音テト的“君はじつに馬鹿だな”可能是在指出此；
5. 重音テト喜欢法棍🥖。

---

どうしてなぜかしら？

[^1]: 7号线由第三运营公司运营
[^2]: 参考：<br />[1] [ピノキオピー - T氏の話を信じるな feat. 初音ミク・重音テト](https://www.bilibili.com/video/BV1SfK9zPEL3). 哔哩哔哩.<br />[2] [【4K/中文字幕】不要相信T氏的话/T氏の話を信じるな/Don’t Believe in T 初音ミク/重音テト 【ピノキオピー】](https://www.bilibili.com/video/BV14Qg6zTEZL). 哔哩哔哩.
[^3]: 萌娘百科. [足立零：二次设定](https://mzh.moegirl.org.cn/%E8%B6%B3%E7%AB%8B%E9%9B%B6#.E4.BA.8C.E6.AC.A1.E8.AE.BE.E5.AE.9A).<br />该章将“笨蛋”列为足立零的常见二次设定之一。