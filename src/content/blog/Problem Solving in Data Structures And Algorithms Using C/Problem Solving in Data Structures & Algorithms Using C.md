---
title: 'Problem Solving in Data Structures & Algorithms Using C : Linked list'
description: 'Linked list'
date: 2026-03-17T14:25:00+01:00
tags: ['ctf', 'cybersecurity']
image: src/content/blog/assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/linked-list-c.png
authors: ['mensi']
draft: false
---

# Problem Solving in Data Structures & Algorithms Using C : Linked list

## Ⅰ. Why we need Linked list

Let us suppose we have an array that contains following five elements 1, 2, 4, 5, 6. We want to insert an
element with value “3” in between “2” and “4”. In the array, we cannot do so easily. We need to create
another array that is long enough to store the current values and one more space for “3”. Then we need to
copy these elements in the new space. This copy operation is inefficient. To remove this fixed length
constraint linked list is used.

## Ⅱ. Linked List

The linked list is a list of items, called nodes. Nodes have two parts, value part and link part. Value part
is used to stores the data. The value part of the node can be either a basic data-type like an integer or
some other data-type like structure.
The link part is a pointer, which is used to store addresses of the next element in the list.

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/4.png>)

## Ⅲ. Types of Linked list

There are different types of linked lists. The main difference among them is how
their nodes refer to each other.

### 1. Singly Linked List

Each node (Except the last node) has a pointer to the next node in the linked list.
The link portion of node contains the address of the next node. The link portion
of the last node contains the value null.

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/1.png>)

### 2. Doubly Linked list

The node in this type of linked list has pointer to both previous and the next node
in the list.

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/2.png>)

### 3. Circular Linked List

This type is similar to the singly linked list except that the last element have
pointer to the first node of the list. The link portion of the last node contains the
address of the first node.

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/3.png>)

### 4. The various parts of linked list

1. Head: Head is a pointer that holds the address of the first node in the linked list.
2. Nodes: Items in the linked list are called nodes.
3. Value: The data that is stored in each node of the linked list.
4. Link: Link part of the node is used to store the address of the node.
   a. We will use “next” and “prev” to store address of next or previous node.

## Ⅳ. Singly Linked List

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/5.png>)

Look at Node in this example, its value part is of type int (it can be of some other data-type). The link is
named as next in the below structure. We have typedef the Node\* to NodePtr so that our code looks clean.

```c
struct Node {
    int value;
    Node *next;
};
typedef Node* NodePtr;
```

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/4.png>)

Note: For a singly linked, we should always test these three test cases before saying that the code is good
to go. This one node and zero node case is used to catch boundary cases. It is always to take care of these
cases before submitting code to the reviewer.

- Zero element / Empty linked list.
- One element / Just single node case.
- General case.

Note: Any program that is likely to change the head pointer is to be passed as a double pointer.

Basic operation of a linked list requires traversing a linked list. The various operations that we can
perform on linked lists, many of these operations require list traversal:

- Insert an element in the list, this operation is used to create a linked list.
- Print various elements of the list.
- Search an element in the list.
- Delete an element from the list.
- Reverse a linked list.

You cannot use Head to traverse a linked list because if we use the head, then we lose the nodes of the
list. We have to use another pointer variable of same data-type as the head.

### 1. Insert element in linked list

An element can be inserted into a linked list in various orders. Some of the example cases are mentioned
below:

1. Insertion of an element at the start of linked list
2. Insertion of an element at the end of linked list
3. Insertion of an element at the 2nd position in linked list
4. Insert element in sorted order in linked list

![alt text](<../assets/posts/Problem Solving in Data Structures And Algorithms Using C/linked-list/6.png>)

#### Example 1

```c
struct Node {
  int value;
  Node * next;
};
typedef Node * NodePtr;
```

```c
int InsertNode(NodePtr * ptrHead, int value) {
  printf("Insert Node: %d", value);
  NodePtr tempPtr = (NodePtr) malloc(sizeof(Node));
  if (!tempPtr)
    return -1;
  tempPtr -> value = value;
  tempPtr -> next = * ptrHead;
  * ptrHead = tempPtr;
  return 1;
}
```

#### Analysis:

Line 1: Double pointer ptrHead is passed to the function as argument, as we want to assign the new node
to the head of the linked list.
Line 3: Value passed as argument is printed to standard output.
Line 4: Memory is allocated for the new node of the list and is pointed by trmpPtr.
Line 5-6: Here it is checked if the system is able to allocate memory if malloc() succeeded in allocating
memory it returns the address of that memory location. Moreover, if malloc() fails to allocate memory,
then it returns NULL.
Line 7: The value passed as argument is stored in the memory pointed by tempPtr
Line 8: The new node next pointer will point to the head of the original list.
Line 9: The head of the original list will now start pointing to tempPtr. There by adding a node at the
beginning of the linked list is done.

### 2. Traversing Linked List

#### Example 2

```c
void PrintList(NodePtr head) {
  while (head) {
    printf("value %d \n", head -> value);
    head = head -> next;
  }
}
```

#### Analysis

Line 1: This function takes the head of the list as input argument.
Line 3: On this line, we are checking if the head is not NULL. If the head is not null then while block will
execute.
Line 5: It prints value stored as the value of the current node.
Line 6: At this line, we are incrementing the head pointer, so that it will point to the next element of the
linked list.

### Complete code for list creation and printing the list.

```c
int main() {
  NodePtr head = NULL;
  int arr[5] = {
    1,
    2,
    3,
    4,
    5
  };
  int i;
  for (i = 0; i < 5; i++) {
    InsertNode( & head, arr[i]);
  }
  return
}
```

#### Analysis:

Line 3: Head pointer of the list is created and it is assigned the value NULL. Head pointing to NULL
means the list is empty.
Line 4: In this, we have created an array of 5 elements. These elements will be sorted in the list.
Line 6-9: Value stored in array are stored in list by calling InsertNode function.
