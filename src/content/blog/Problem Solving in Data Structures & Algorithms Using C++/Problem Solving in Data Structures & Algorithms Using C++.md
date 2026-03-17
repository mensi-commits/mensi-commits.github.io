---
title: 'Problem Solving in Data Structures & Algorithms Using C++ : Linked list'
description: 'Solving picoCTF binary exploitation challenges.'
date: 2026-03-17T14:25:00+01:00
tags: ['ctf', 'cybersecurity']
image: ../images/linked-list-cpp.png
authors: ['mensi']
draft: false
---

# Problem Solving in Data Structures & Algorithms Using C++ : Linked list

## Why we need Linked list

Let us suppose we have an array that contains following five elements 1, 2, 4, 5, 6. We want to insert a new element with value “3” in between “2” and “4”. In the
array, we cannot do so easily. We need to create another array that is long
enough to store the current values and one more space for “3”. Then we need to
copy these elements in the new space. This copy operation is inefficient. To
remove this fixed length constraint linked list is used.

## Types of Linked list

There are different types of linked lists. The main difference among them is how
their nodes refer to each other.

### Singly Linked List

Each node (Except the last node) has a pointer to the next node in the linked list.
The link portion of node contains the address of the next node. The link portion
of the last node contains the value null.

![Alt Text](src/content/blog/images/assets/posts/dsa-algorithms-cpp/linked-list/1.png)

### Doubly Linked list

The node in this type of linked list has pointer to both previous and the next node
in the list.

![Alt Text](src/content/blog/images/assets/posts/dsa-algorithms-cpp/linked-list/2.png)
