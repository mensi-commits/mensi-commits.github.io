---
title: 'Grid L – Codeforces Round 1093 (Div. 2) Writeup'
description: 'Grid L Problem from Codeforces'
date: 2026-04-22T19:31:00+01:00
tags: ['CP', 'competitive programming', 'math', 'constructive']
authors: ['mensi']
image: ../assets/codeforces/grid-l/2.png
draft: false
maths: true
---

# **Grid L – Codeforces Round 1093 (Div. 2) Writeup**

![Alt text](../assets/codeforces/grid-l/1.png)

## **Problem Summary**

Roger has:

- $p$ unit-length straight segments
- $q$ L-shaped pieces, each consisting of **two** unit segments joined at a right angle

He wants to use **all pieces** to form a rectangular grid of size $n \times m$.

A grid of size $n \times m$ has:

- $(n+1)m$ vertical unit edges
- $(m+1)n$ horizontal unit edges

So the total number of unit edges needed is:

$$
(n+1)m + (m+1)n = 2nm + n + m
$$

Each L-shaped piece contributes exactly $2$ unit segments, so the total number of available unit edges is:

$$
p + 2q
$$

Thus we need to find positive integers $n,m$ such that:

$$
2nm + n + m = p + 2q
$$

If no such $n,m$ exist, we output $-1$.

---

## **Observations**

At first glance this looks like a geometry problem, but it reduces to a pure algebraic identity.

Start from:

$$
2nm + n + m = p + 2q
$$

Multiply both sides by $2$ and add $1$:

$$
2(2nm + n + m) + 1 = 2(p + 2q) + 1
$$

The left side becomes:

$$
4nm + 2n + 2m + 1
$$

Now notice the factorization:

$$
(2n+1)(2m+1) = 4nm + 2n + 2m + 1
$$

So the equation is equivalent to:

$$
(2n+1)(2m+1) = 2(p+2q) + 1
$$

Let:

$$
S = 2(p+2q) + 1
$$

Then the problem becomes:

$$
(2n+1)(2m+1) = S
$$

---

## **Key Idea**

If we can find two divisors $a$ and $b$ such that:

$$
a \cdot b = S
$$

then we can set:

$$
2n+1 = a, \quad 2m+1 = b
$$

which gives:

$$
n = \frac{a-1}{2}, \quad m = \frac{b-1}{2}
$$

Since $S$ is always odd, all its divisors are odd too, so $a-1$ and $b-1$ are always divisible by $2$.

So the entire problem reduces to:

> Find any divisor pair $(a,b)$ of $S$ such that both $n$ and $m$ are positive.

---

## **Step-by-Step Solution**

For each test case:

1. Read $p$ and $q$
2. Compute:

$$
S = 2(p+2q) + 1
$$

3. Enumerate all divisors $d$ from $1$ to $\sqrt{S}$
4. If $d \mid S$, then:

$$
a=d,\quad b=\frac{S}{d}
$$

5. Compute:

$$
n=\frac{a-1}{2}, \quad m=\frac{b-1}{2}
$$

6. If $n \ge 1$ and $m \ge 1$, output $(n,m)$.
7. If no divisor works, output $-1$.

---

## **Example Walkthrough**

### Example: $p=1, q=3$

Compute total edges:

$$
p+2q = 1 + 2\cdot 3 = 7
$$

Compute $S$:

$$
S = 2(p+2q)+1 = 2\cdot 7 + 1 = 15
$$

Factorize:

$$
15 = 3 \cdot 5
$$

So:

$$
n = \frac{3-1}{2} = 1, \quad m = \frac{5-1}{2} = 2
$$

Output:

1 2

---

## **Code Implementation (Python)**

```python
import math

t = int(input())

for _ in range(t):
    p, q = map(int, input().split())

    S = 2 * (p + 2 * q) + 1
    root = int(math.isqrt(S))

    found = False

    for d in range(1, root + 1):
        if S % d == 0:
            a = d
            b = S // d

            n = (a - 1) // 2
            m = (b - 1) // 2

            if n >= 1 and m >= 1:
                print(n, m)
                found = True
                break

    if not found:
        print(-1)
```

---

## **Complexity Analysis**

We iterate over divisors up to $\sqrt{S}$.

Since:

$$
S = 2(p+2q)+1 \le 2(10^8 + 2\cdot 10^8)+1 \approx 6\cdot 10^8
$$

then:

$$
\sqrt{S} \approx 24500
$$

So:

- **Time complexity:** $O(\sqrt{S})$ per test case
- **Space complexity:** $O(1)$

Efficient under all constraints.

---

## **Takeaways**

- The grid edge count formula looks messy, but it hides a clean identity.
- The crucial transformation is:

$$
(2n+1)(2m+1) = 2(p+2q)+1
$$

- Once we reach this form, the problem becomes a divisor search.
- This is a classic Codeforces trick: turn a counting equation into factorization.
