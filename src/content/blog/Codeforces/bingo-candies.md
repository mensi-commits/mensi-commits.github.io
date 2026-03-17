---
title: 'Bingo Candies'
description: 'Bingo Candies Problem from Codeforces'
date: 2026-03-17T14:25:00+01:00
tags: ['codeforces', 'competitive programming']
authors: ['mensi']
draft: false
maths: true
---

# **Bingo Candies – Codeforces Round 1086 (Div. 2) Writeup**

![Alt text](src/content/blog/images/assets/posts/codeforces/bingo-candies/1.png)

## **Problem Summary**

Alice has an $n \times n$ board filled with colored candies. Each cell contains a candy of some color $a_{i,j}$. Bob wants to know if he can **rearrange the candies** so that **no row or column has all candies of the same color**.

We are given multiple test cases, and for each, we need to determine if such a rearrangement is possible.

**Constraints:**

- $1 \le t \le 500$ test cases
- $1 \le n \le 100$ (sum of all $n \le 500$)
- Colors are integers from 1 to $n^2$

**Output:**
Print `"YES"` if a valid rearrangement exists, `"NO"` otherwise.

---

## **Observations**

Let $x$ be the color with the **maximum number of candies**, denoted $a$.

**Key observation:**

- The answer is **YES** if and only if $a \le n^2 - n$.
- If $a > n^2 - n$, there are fewer than $n$ candies of other colors. With $n$ rows, at least one row will be filled entirely with color $x$ → violates the rules.
- If $a \le n^2 - n$, we can always construct a valid board (proof below).

---

## **Construction Idea**

1. **If $a < n$**:

   - No color has enough candies to fill a row or column.
   - We can arrange candies arbitrarily.

2. **Otherwise, $n \le a \le n^2 - n$**:

   - Place $n$ candies of color $x$ along the main diagonal: $a*{1,1}, a*{2,2}, ..., a\_{n,n}$.
   - Take $n$ candies not of color $x$ and place them along the “wrap-around diagonal”: $a*{1,2}, a*{2,3}, ..., a*{n-1,n}, a*{n,1}$.
   - Place the remaining candies arbitrarily.

**Result:** Each row and column contains at least **two colors**, satisfying the constraints.

---

## **Step-by-Step Solution**

![Alt text](src/content/blog/images/assets/posts/codeforces/bingo-candies/3.png)

1. Read input for $t$ test cases.
2. For each test case:

   - Count the frequency of each color.
   - If any color appears more than $n^2 - n$ → `NO`.
   - Otherwise → `YES`.

---

### **Example Walkthrough**

**Input:**

```
3
3
1 2 3
3 1 4
4 1 2
3
1 1 1
2 3 4
1 4 3
3
1 1 1
1 1 1
1 1 2
```

- **Test case 1:** Max frequency ≤ 6 → `YES`.
- **Test case 2:** Max frequency ≤ 6 → `YES`.
- **Test case 3:** Color 1 appears 7 (>6) → `NO`.

---

## **Code Implementation (Python)**

```python
t = int(input())

for _ in range(t):
    n = int(input())
    freq = {}

    for _ in range(n):
        row = list(map(int, input().split()))
        for val in row:
            freq[val] = freq.get(val, 0) + 1

    if max(freq.values()) > n * n - n:
        print("NO")
    else:
        print("YES")
```

**Explanation:**

- Count occurrences of each color.
- If any color appears more than $n^2 - n$, print `"NO"`.
- Otherwise, print `"YES"`.

---

## **Complexity Analysis**

- **Time complexity:** $O(t \cdot n^2)$ → each board cell is visited once.
- **Space complexity:** $O(n^2)$ → for storing frequency of colors.

Efficient under given constraints.

---

## **Takeaways**

- This constructive problem **reduces to a counting problem**.
- Always check **frequency limits** before attempting complex arrangements.
- Simple counting avoids unnecessary brute-force and gives an elegant solution.
