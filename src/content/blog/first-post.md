---
title: 'The blog is under construction.'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Apr. 06 2026'
---

The blog is under construction.

test of mathjax: 

$\cfrac{2}{\cfrac{1}{a} + \cfrac{1}{b}} \leq \sqrt{ab} \leq \cfrac{a + b}{2} \leq \sqrt{\cfrac{a^2+b^2}{2}}$

$$
I_3 = 
\begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1
\end{bmatrix}
$$

test of code block:

```c++
// some nonsense code
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
"some trivial proof"

Inductive Odd : nat -> Type :=
  | odd_1: Odd 1
  | odd_S_S_n: forall (n : nat), Odd n -> Odd (S (S n))
  end.

Example 0_is_not_odd : Odd 0 -> False.
Proof.
  inversion. Qed.
```

```powershell
# some powershell script copy from somewhere else

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