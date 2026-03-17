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

Alice has an ( $n \times n$ ) board filled with colored candies. Each cell contains a candy of some color ( a\_{i,j} ). Bob wants to know if he can **rearrange the candies** so that **no row or column has all candies of the same color**.

We are given multiple test cases, and for each, we need to determine if such a rearrangement is possible.

**Constraints:**

- ( $1 \le t \le 500$ ) test cases
- ( $1 \le n \le 100$ ) (sum of all ( n ) ≤ 500)
- Colors are integers from 1 to ( $n^2$ )

**Output:**
Print `"YES"` if a valid rearrangement exists, `"NO"` otherwise.

---

## **Initial Thoughts**

The problem can be simplified as:

> Is it possible to rearrange the candies so that **no row or column contains identical candies**?

Observations:

1. **If any candy appears more than ( n ) times**, it is impossible to avoid a row or column of the same color.

   - Why? Because even if we spread them optimally, at least one row or column will end up fully occupied by that color.

2. **If all colors appear ≤ ( n ) times**, then we can always rearrange them so that no row or column is uniform.

So the problem reduces to **counting the occurrences of each color**.

---

## **Step-by-Step Solution**

![Alt text](src/content/blog/images/assets/posts/codeforces/bingo-candies/3.png)

1. **Read input** for ( t ) test cases.
2. For each test case:

   - Count the frequency of each color.
   - If any color occurs more than ( n ) times → `NO`.
   - Otherwise → `YES`.

---

### **Example Walkthrough**

**Input Example:**

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

**Test case 1:**
No color exceeds 3 times → `YES`.

**Test case 2:**
Color 1 appears exactly 3 times (row 1 has all 1's) → can rearrange → `YES`.

**Test case 3:**
Color 1 appears 7 times (>3) → cannot rearrange → `NO`.

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

    if max(freq.values()) > n:
        print("NO")
    else:
        print("YES")
```

**Explanation:**

- We count the occurrences of each color using a dictionary.
- If any color appears more than `n` times, we print `"NO"`.
- Otherwise, `"YES"` is printed.

---

## **Complexity Analysis**

- **Time complexity:** ( $O(t \cdot n^2)$ ) → each board cell is visited once.
- **Space complexity:** ( $O(n^2)$ ) → for storing frequency of colors.
- Fits comfortably under the given constraints.

---

## **Takeaways**

- Sometimes, **a constructive problem reduces to a counting problem**.
- Always check **frequency constraints** first before attempting complex rearrangements.
- This approach avoids unnecessary brute force permutations, making the solution efficient and elegant.
