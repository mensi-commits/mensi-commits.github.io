---
title: 'Designing and Implementing a Virtual Machine in C'
description: 'Designing and Implementing a Virtual Machine in C'
date: 2026-03-17T14:25:00+01:00
tags: ['Virtual Machine', 'VM']
image: ../images/virtual-machine.png
authors: ['mensi']
draft: false
---

# Building TIM: A Virtual Machine in C

I built TIM as a way to understand how virtual machines actually work under the hood.

There’s a point where reading about interpreters, CPUs, or execution models stops being enough. I wanted something concrete, something I could control completely, so I decided to build a small virtual machine in C. That project became TIM.

Right now, TIM supports around 45 instructions, native functions, and a full toolchain: an assembler (`tasm`) and a runtime (`tire`). The workflow is simple: write assembly, assemble it into bytecode, then run it on the VM. But behind that simple loop is a structure that mirrors how real machines behave.

## The architecture at a glance

From the beginning, I wanted to keep the architecture clean and separated. The assembler should only care about turning text into instructions, and the runtime should only care about executing them.

That naturally led to this structure:

![Alt text](src/content/blog/images/assets/posts/VM-design-and-implement/1.png)

This separation ended up being one of the most important design decisions. It made the system easier to reason about and easier to extend. If something breaks, I know exactly which layer to look at.

## Designing the machine

At the core of TIM is a single structure: `Machine`.

Everything lives inside it, the stack, registers, memory, instructions, and even the table of native functions. I like thinking of it as the “state of the universe” for the VM. The execution loop just mutates this state over and over.

![Alt text](src/content/blog/images/assets/posts/VM-design-and-implement/2.png)

One thing I spent time on was how to represent values. I didn’t want separate systems for integers, floats, and other types, so I used a `Word` union combined with a `DataType` enum. That way, the VM can carry different types around while still knowing what they are.

It’s a small detail, but it simplifies a lot of the execution logic.

## The instruction set

Designing the instruction set was probably the most fun part.

I didn’t want it to be just arithmetic. I wanted it to feel like a real machine, so I added:

- stack operations
- arithmetic (integer and floating-point)
- comparisons
- control flow (jumps, calls, returns)
- type conversions
- I/O operations
- native function calls

Here’s roughly how I think about the instruction categories:

![Alt text](src/content/blog/images/assets/posts/VM-design-and-implement/3.png)

The goal wasn’t to make it huge, but to make it expressive enough to run meaningful programs.

## The execution loop

At the end of the day, everything comes down to a loop.

Load the bytecode, read the next instruction, execute it, update the machine, and repeat.

![Alt text](src/content/blog/images/assets/posts/VM-design-and-implement/4.png)

There’s nothing fancy about the loop itself. The interesting part is everything it touches. Every instruction changes the state in some way, and over time those changes produce the behavior of the program.

That’s when it clicked for me: a virtual machine is just controlled state transitions.

## What I learned building TIM

The biggest takeaway from this project is that virtual machines are not as mysterious as they seem.

They’re built from simple ideas:

- a structured representation of instructions
- a consistent way to store data
- a loop that interprets instructions
- a clear model of state

Once those pieces are in place, everything else is incremental.

TIM is still a small project, but it already behaves like a real machine. It has its own instruction set, its own execution model, and its own way of interacting with the outside world through native functions.

And more importantly, it’s something I can read, modify, and fully understand.
