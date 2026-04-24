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

# **Grid L – Codeforces Round 1093 (Div. 2)**

![Alt text](../assets/codeforces/grid-l/1.png)

## **Problem Summary**

Roger has:

- $p$ straight unit segments
- $q$ L-shaped pieces (each L uses **2 unit segments**, one horizontal and one vertical)

He wants to use **all pieces** to build a rectangular grid of size $n \times m$.

A grid $n \times m$ contains:

- Horizontal edges:
  $$H = m(n+1)$$

- Vertical edges:
  $$V = n(m+1)$$

So the total number of unit edges in the grid is:

$$
H + V = m(n+1) + n(m+1) = 2nm + n + m
$$

Available edges are:

$$
p + 2q
$$

So we must satisfy:

$$
2nm + n + m = p + 2q
$$

If no such $n, m$ exist, output $-1$.

---

## **Main Observation**

Starting from:

$$
2nm + n + m = p + 2q
$$

Multiply by $2$ and add $1$:

$$
2(2nm + n + m) + 1 = 2(p + 2q) + 1
$$

Left side becomes:

$$
4nm + 2n + 2m + 1
$$

But:

$$
(2n+1)(2m+1) = 4nm + 2n + 2m + 1
$$

So we get the identity:

$$
(2n+1)(2m+1) = 2(p + 2q) + 1
$$

Let:

$$
S = 2(p + 2q) + 1
$$

Then the problem becomes:

$$
(2n+1)(2m+1) = S
$$

---

## **Divisor Transformation**

If we find divisors $a$ and $b$ such that:

$$
a \cdot b = S
$$

Then:

$$
2n+1 = a,\quad 2m+1 = b
$$

So:

$$
n = \frac{a-1}{2}, \quad m = \frac{b-1}{2}
$$

Since $S$ is always odd, its divisors are also odd, meaning $(a-1)$ and $(b-1)$ are always divisible by $2$.

So the task becomes:

> Find any divisor pair $(a,b)$ of $S$ giving positive integers $n,m$.

---

## **Extra Constraint (Important)**

Even if the total number of edges matches, we must also ensure we can place all $q$ L-shaped pieces.

Each L-piece consumes:

- $1$ horizontal edge
- $1$ vertical edge

So we need:

$$
q \le H
$$

and

$$
q \le V
$$

Where:

$$
H = m(n+1), \quad V = n(m+1)
$$

If either fails, then this $(n,m)$ is not valid.

---

## **Algorithm Used in the Code**

For each test case:

1. Read $p, q$
2. Compute:

$$
S = 2(p + 2q) + 1
$$

3. Find divisors of $S$ by looping from $3$ to $\sqrt{S}$ (only odd divisors)
4. Store divisor candidates inside a linked list
5. For each divisor $a$ in the list:

   - Compute $b = S/a$
   - Compute:

$$
n = \frac{a-1}{2}, \quad m = \frac{b-1}{2}
$$

- Compute $H$ and $V$
- Check if $q \le H$ and $q \le V$

6. If found, print $n$ and $m$
7. Otherwise print $-1$

---

## **Why Use a Linked List Here?**

Normally, you could just check divisor pairs directly.

But in this solution we kept the same skeleton:

- store divisor candidates inside a linked list
- traverse the linked list to test possible $(a,b)$ pairs

So it matches the structure: `InsertAtEnd()`, `diviseurs()`, `tempNode`, etc.

---

## **Complexity Analysis**

We search divisors up to:

$$
\sqrt{S}
$$

And:

$$
S = 2(p + 2q) + 1 \le 2(10^8 + 2\cdot 10^8) + 1 \approx 6\cdot 10^8
$$

So:

$$
\sqrt{S} \approx 24500
$$

This is very fast.

- **Time complexity:** $O(\sqrt{S})$ per test case
- **Memory complexity:** $O(k)$ where $k$ is the number of stored divisors

---

## **Final C Code**

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef struct Node{
    int value;
    struct Node *next;
}Node;

typedef Node* NodePtr;

void PrintList(NodePtr head)
{
    while(head)
    {
        printf("value %d\n",head->value);
        head=head->next;
    }
}

int InsertAtEnd(NodePtr *ptrHead,int value)
{
    NodePtr head=*ptrHead;
    NodePtr tempNode=(NodePtr)malloc(sizeof(Node));

    if(!tempNode) return -1;

    tempNode->value=value;
    tempNode->next=NULL;

    if(head==NULL)
    {
        *ptrHead=tempNode;
        return 1;
    }

    while(head->next!=NULL) head=head->next;
    head->next=tempNode;
    return 1;
}

NodePtr diviseurs(NodePtr head,int number)
{
    for(int i=3;i<=sqrt(number);i+=2)
    {
        if(number%i==0)
        {
            InsertAtEnd(&head,i);

            int other=number/i;
            if(other!=i) InsertAtEnd(&head,other);
        }
    }
    return head;
}

int main()
{
    int t;
    scanf("%d",&t);

    while(t--)
    {
        int p,q;
        scanf("%d %d",&p,&q);

        int S=2*(p+2*q)+1;

        NodePtr head=NULL;
        head=diviseurs(head,S);

        NodePtr tempNode=head;

        int n=-1,m=-1;
        int found=0;

        while(tempNode!=NULL)
        {
            int a=tempNode->value;
            int b=S/a;

            if((a-1)%2==0 && (b-1)%2==0)
            {
                n=(a-1)/2;
                m=(b-1)/2;

                int H=m*(n+1);
                int V=n*(m+1);

                if(q<=H && q<=V)
                {
                    found=1;
                    break;
                }
            }

            tempNode=tempNode->next;
        }

        if(found) printf("%d %d\n",n,m);
        else printf("-1\n");
    }

    return 0;
}
```

---

## **Takeaways**

The trick is transforming:

$$
2nm + n + m = p + 2q
$$

into the factorized form:

$$
(2n+1)(2m+1) = 2(p+2q)+1
$$

Then it becomes a divisor search problem.

After getting $(n,m)$, we must also verify that the $q$ L-shaped pieces fit:

$$
q \le H,\quad q \le V
$$

This is the full reasoning behind the solution.
