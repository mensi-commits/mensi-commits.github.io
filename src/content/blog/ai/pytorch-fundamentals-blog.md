---
title: 'PyTorch From Zero: Tensors, Training Loops, and Other Ways to Upset Your GPU'
description: 'A meme-powered beginner guide to PyTorch tensors, training loops, regression, neural network classification, FashionMNIST, CNNs, and computer vision—with runnable Python examples.'
date: 2026-11-11T22:51:00+01:00
tags:
  [
    'AI',
    'machine learning',
    'PyTorch',
    'deep learning',
    'Python',
    'neural networks',
    'classification',
    'computer vision',
    'CNN',
  ]
authors: ['mensi']
# image: ../assets/pytorch-fundamentals/cover.png  # Uncomment after adding your cover image.
draft: false
maths: true
---

# PyTorch From Zero: Tensors, Training Loops, and Other Ways to Upset Your GPU

So you've decided to learn deep learning.

You have heard about neural networks, watched a few videos with glowing brain diagrams, and possibly convinced yourself that AI is a mysterious digital creature with opinions about cats.

Then you open PyTorch.

```python
import torch
```

That's it. Welcome to the part where the magic turns out to be **numbers**. A _lot_ of numbers. And most of the time, the numbers are inside things called **tensors**.

This article is a practical tour of PyTorch fundamentals. We'll make tensors, interrogate their shapes, multiply them, rearrange them, move them to a GPU, and learn why your future debugging career will mostly involve staring at brackets.

> **What you'll learn:** Part I covers tensor creation; dimensions, shapes, data types, matrix multiplication, NumPy, reproducibility, and CPU/GPU management. Part II walks through the full training workflow: data, models, predictions, loss, optimizers, training loops, evaluation, and saving your first model. Part III tackles classification, sigmoid, softmax, non-linearity, and training binary and multi-class neural networks. Part IV introduces computer vision, FashionMNIST, CNNs, and practical image-model evaluation.

> **Source and credit:** This article is an original, condensed blog-style adaptation of the _00. PyTorch Fundamentals_ notebook by **Daniel Bourke** (with Parts II–IV adapted from his subsequent workflow, classification, and computer vision notebooks), from [Learn PyTorch for Deep Learning](https://www.learnpytorch.io/) and the [PyTorch Deep Learning GitHub repository](https://github.com/mrdbourke/pytorch-deep-learning). The original notebook, exercises, and walkthrough are excellent if you want to go deeper. The examples here have been regrouped and rewritten for article format.

---

# Part I — PyTorch Fundamentals: Surviving the Tensors

> **PART 1 OF 4 — FUNDAMENTALS**  
> Tensors, shapes, matrix multiplication, NumPy, and CPU/GPU fundamentals. The numbers have entered the chat.

---

## 1. What even is PyTorch?

[PyTorch](https://pytorch.org/) is an open-source framework for numerical computing, machine learning, and deep learning. It gives Python developers tools for working with multidimensional arrays, building neural networks, computing gradients, and accelerating calculations on supported hardware.

In ordinary Python, you might write a loop to manipulate a list of numbers. In PyTorch, you can operate on a tensor directly and let highly optimized tensor operations do the heavy lifting.

The basic workflow behind many neural networks looks roughly like this:

![Hand-drawn neural network workflow](../assets/ai-for-everyone/Hand-Drawn%20Neural%20Network%20Flow%20Sketch.png)

Notice what is missing? A tiny robot sitting inside your laptop and thinking really hard.

It's math, optimization, and a lot of repeated computation.

### Running the code

Use [Google Colab](https://colab.research.google.com/) or install PyTorch following the [official installation guide](https://pytorch.org/get-started/locally/). You can check that it's available with:

```python
import torch

print(torch.__version__)
print(torch.cuda.is_available())  # True only when a compatible CUDA device is available
```

The version number depends on your environment. That's normal. The original notebook was recorded with an older PyTorch release, so don't worry if your version doesn't match its screenshots.

![Hand-drawn neural network workflow](../assets/ai-for-everyone/AI%20Engineer%20Starter%20Pack%20Infographic.png)

---

## 2. Tensors: the data containers doing all the work

A **tensor** is a multidimensional array of values. It's how PyTorch represents numerical data.

A number can be a tensor. A list of numbers can be a tensor. A spreadsheet can be a tensor. Even an image can become a tensor: each pixel is described by numerical values.

![Hand-drawn neural network workflow](../assets/ai-for-everyone/Image%20Representation%20in%20Tensors%20Infographic.png)

For instance, a color image could have shape `[3, 224, 224]`:

- `3` color channels: red, green, and blue.
- `224` pixels in height.
- `224` pixels in width.

That arrangement is called **channels-first**. Other libraries or pipelines may use `[224, 224, 3]`, or **channels-last**. The same information, different arrangement. You will learn to care about this distinction—usually immediately after receiving a shape error.

### Scalar, vector, matrix, tensor: the family reunion

| Name                | Example             | Number of dimensions | Shape                   |
| ------------------- | ------------------- | -------------------: | ----------------------- |
| Scalar              | `7`                 |                    0 | `[]`                    |
| Vector              | `[7, 7]`            |                    1 | `[2]`                   |
| Matrix              | `[[7, 8], [9, 10]]` |                    2 | `[2, 2]`                |
| Higher-order tensor | A stack of matrices |            3 or more | For example `[1, 3, 3]` |

Technically, _tensor_ is the general term: scalars, vectors, and matrices are all tensors. The table just gives names to common dimensionalities.

```python
import torch

scalar = torch.tensor(7)
vector = torch.tensor([7, 7])
matrix = torch.tensor([
    [7, 8],
    [9, 10]
])
tensor_3d = torch.tensor([
    [
        [1, 2, 3],
        [3, 6, 9],
        [2, 4, 5]
    ]
])

for name, value in [
    ("scalar", scalar),
    ("vector", vector),
    ("matrix", matrix),
    ("tensor_3d", tensor_3d),
]:
    print(name, "-> ndim:", value.ndim, "shape:", tuple(value.shape))
```

Expected output:

```text
scalar -> ndim: 0 shape: ()
vector -> ndim: 1 shape: (2,)
matrix -> ndim: 2 shape: (2, 2)
tensor_3d -> ndim: 3 shape: (1, 3, 3)
```

A tensor's `ndim` tells you **how many axes** it has. Its `shape` tells you **how many entries fit along each axis**.

Two numbers in a vector do not magically create two dimensions. That's not how dimensions work, despite what science fiction may have promised you.

To extract a Python number from a single-element tensor:

```python
print(scalar.item())  # 7
```

`.item()` only works when the tensor contains exactly **one** element.

**Image placeholder:** _Four panels showing a scalar, a vector, a matrix, and a 3D block of numbers. Label them “the tensor cinematic universe.”_

<!-- IMAGE: ../assets/pytorch-fundamentals/tensor-dimensions.png -->

---

## 3. Creating tensors without typing every number like a maniac

You can hand-write a tiny tensor, but machine learning projects usually handle thousands, millions, or billions of numerical values. Typing them individually is not a scalable career choice.

PyTorch provides convenient constructors.

### Random tensors

```python
random_tensor = torch.rand(3, 4)
print(random_tensor)
print(random_tensor.shape)  # torch.Size([3, 4])
```

`torch.rand()` produces random floating-point values in the interval `[0, 1)`. They're often useful when exploring tensors or initializing values. The exact output changes across runs unless you control randomness, which we'll do later.

You can create something shaped like an image, too:

```python
fake_image = torch.rand(224, 224, 3)
print(fake_image.shape)  # torch.Size([224, 224, 3])
```

That's an **image-shaped tensor**, not a meaningful photo. The pixels are random. If a model recognizes a dog in there, it may be time to ask some questions.

### Zeros and ones

```python
zeros = torch.zeros(3, 4)
ones = torch.ones(3, 4)

print(zeros)
print(ones)
```

Why would anyone want a rectangle full of zeros? Masks, placeholders, initial values, and lots of other numerical-computing tasks.

### Ranges

```python
numbers = torch.arange(start=0, end=10, step=1)
print(numbers)
# tensor([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
```

The ending value is **excluded**. PyTorch's old `torch.range()` is deprecated; use `torch.arange()`.

### Matching another tensor's shape

```python
same_shape_zeros = torch.zeros_like(numbers)
same_shape_ones = torch.ones_like(numbers)

print(same_shape_zeros.shape)  # torch.Size([10])
print(same_shape_ones.shape)   # torch.Size([10])
```

`zeros_like()` and `ones_like()` are useful when you already have a tensor and want a new tensor with matching shape and, by default, matching data type and device.

---

## 4. The three questions that prevent approximately 80% of tensor drama

When something breaks, check:

1. **Shape:** How are the values arranged?
2. **Dtype:** What kind of numbers are stored?
3. **Device:** Are they on the CPU, CUDA GPU, or another supported accelerator?

```python
x = torch.rand(3, 4)

print("shape:", x.shape)
print("dtype:", x.dtype)
print("device:", x.device)
```

On a typical CPU environment, you'll see:

```text
shape: torch.Size([3, 4])
dtype: torch.float32
device: cpu
```

### What's a dtype?

A **data type** determines how values are stored. Common examples include `torch.float32`, `torch.float16`, `torch.float64`, and integer types such as `torch.int64`.

```python
normal_precision = torch.tensor([3.0, 6.0, 9.0], dtype=torch.float32)
half_precision = torch.tensor([3.0, 6.0, 9.0], dtype=torch.float16)
integers = torch.tensor([3, 6, 9], dtype=torch.int64)

print(normal_precision.dtype)
print(half_precision.dtype)
print(integers.dtype)
```

Lower-precision representations generally use less memory and can accelerate suitable hardware operations. But there's a tradeoff: less representable precision and sometimes different numerical behavior. **Lower precision isn't universally faster, and it doesn't automatically mean worse model accuracy**—the result depends on the operation and hardware.

You can convert dtypes with `.to()`:

```python
x = torch.tensor([1.5, 2.5, 3.5])
print(x.to(torch.float16).dtype)  # torch.float16
```

> **Debugging mantra:** Wrong shape? Wrong dtype? Wrong device? Check all three before negotiating with your screen.

---

## 5. Tensor math: arithmetic, but now everyone is invited

Most deep learning boils down to mathematical operations repeated at ridiculous scale.

Let's begin with ordinary arithmetic:

```python
x = torch.tensor([1, 2, 3])

print(x + 10)   # tensor([11, 12, 13])
print(x - 10)   # tensor([-9, -8, -7])
print(x * 10)   # tensor([10, 20, 30])
print(x / 10)   # tensor([0.1000, 0.2000, 0.3000])
print(x)        # still tensor([1, 2, 3])
```

These operations create a result; they don't change `x` unless you assign the result or use an explicit in-place operation.

```python
x = x + 10
print(x)  # tensor([11, 12, 13])
```

There are also named operations such as `torch.add()` and `torch.multiply()`:

```python
y = torch.tensor([1, 2, 3])

print(torch.add(y, 10))
print(torch.multiply(y, 10))
```

### Element-wise multiplication vs. matrix multiplication

This is an important distinction. Put down the coffee for five seconds.

**Element-wise multiplication** multiplies corresponding entries:

```python
x = torch.tensor([1, 2, 3])
print(x * x)  # tensor([1, 4, 9])
```

Mathematically:

$$
[1,2,3] \odot [1,2,3] = [1,4,9]
$$

**Matrix multiplication / dot product**, for two one-dimensional vectors, multiplies corresponding entries **and adds the results**:

```python
print(torch.matmul(x, x))  # tensor(14)
print(x @ x)               # tensor(14)
```

Because:

$$
1\times1 + 2\times2 + 3\times3 = 14
$$

Same numbers. Different operation. Significantly different output. `@` is Python's matrix-multiplication operator; `torch.matmul()` is the explicit function. Both are valid.

### The inner-dimension law

For matrix multiplication:

$$
(m \times \color{blue}{n})\;(\color{blue}{n} \times p)
\longrightarrow (m \times p)
$$

The **inner dimensions must match**. The resulting matrix has the **outer dimensions**.

| Left shape | Right shape | Valid? | Output shape |
| ---------- | ----------- | ------ | ------------ |
| `(2, 3)`   | `(3, 2)`    | Yes    | `(2, 2)`     |
| `(3, 2)`   | `(2, 3)`    | Yes    | `(3, 3)`     |
| `(3, 2)`   | `(3, 2)`    | No     | Shape error  |

That's basically the nightclub bouncer of matrix multiplication: **“Your inner dimensions aren't on the list.”**

**Image placeholder:** _A matrix multiplication diagram, with matching inner dimensions highlighted and a tiny bouncer rejecting invalid shapes._

<!-- IMAGE: ../assets/pytorch-fundamentals/matrix-multiplication.png -->

---

## 6. Shape errors: PyTorch's favorite way of saying “absolutely not”

Let's manufacture a classic problem:

```python
A = torch.tensor([
    [1, 2],
    [3, 4],
    [5, 6]
], dtype=torch.float32)

B = torch.tensor([
    [7, 10],
    [8, 11],
    [9, 12]
], dtype=torch.float32)

print(A.shape)  # torch.Size([3, 2])
print(B.shape)  # torch.Size([3, 2])
```

`A @ B` cannot work because `(3, 2) @ (3, 2)` has incompatible inner dimensions (`2` versus `3`).

The solution in this example is to **transpose** `B`:

```python
print(B.T.shape)   # torch.Size([2, 3])
result = A @ B.T

print(result)
print(result.shape)  # torch.Size([3, 3])
```

Expected result:

```text
tensor([[ 27.,  30.,  33.],
        [ 61.,  68.,  75.],
        [ 95., 106., 117.]])
```

A transpose exchanges axes. For a 2D matrix, rows become columns.

```python
B_transposed = torch.transpose(B, dim0=0, dim1=1)
print(torch.equal(B.T, B_transposed))  # True
```

**Important:** Transposing a tensor only fixes a shape mismatch when the underlying computation actually calls for the transposed arrangement. Never transpose random things just to silence errors; that's the numerical equivalent of applying duct tape to a broken compass.

### A neural network layer is already doing matrix multiplication

A fully connected layer, `torch.nn.Linear`, computes a transformation of the form:

$$
Y = XW^T + b
$$

Here `X` is the input, `W` contains learned weights, and `b` is the bias. The layer starts with initialized parameters that can later be adjusted through training.

```python
torch.manual_seed(42)

layer = torch.nn.Linear(in_features=2, out_features=6)
output = layer(A)

print("input:", A.shape)       # torch.Size([3, 2])
print("output:", output.shape) # torch.Size([3, 6])
```

Three input rows, two features per row. Six output features per row.

You have now encountered one of the most common pieces of a neural network. No glowing brain necessary.

---

## 7. Aggregation: asking your tensor to summarize itself

Sometimes you don't need every value. You need a summary: the smallest number, largest number, average, or total.

```python
x = torch.arange(0, 100, 10)
print(x)
# tensor([ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90])

print(x.min())  # tensor(0)
print(x.max())  # tensor(90)
print(x.sum())  # tensor(450)
```

For the mean, use a floating-point dtype:

```python
print(x.float().mean())  # tensor(45.)
```

PyTorch's standard mean operation does not accept integer input tensors directly. Convert them first.

### Where is the smallest or largest value?

`argmin()` and `argmax()` return **indices**, not values:

```python
scores = torch.tensor([50, 20, 80, 30])

print(scores.argmax())  # tensor(2)
print(scores.argmin())  # tensor(1)
```

The biggest score is `80`, at index `2`. Python starts counting from zero, as it always has, because apparently counting normally would be too easy.

### Casting values

```python
x = torch.arange(10.0, 100.0, 10.0)

print(x.dtype)                    # torch.float32
print(x.to(torch.float16).dtype)  # torch.float16
print(x.to(torch.int8).dtype)     # torch.int8
```

Beware: converting values to a small integer type can truncate fractional parts or overflow the representable range. Choose a dtype that makes sense for the values and computation.

---

## 8. Reshape, view, stack, squeeze, unsqueeze, permute: the shape-shifting arc

Tensor operations are very particular about dimensions, so PyTorch gives you a collection of tools for rearranging them.

| Method           | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `reshape(...)`   | Changes the apparent shape while keeping the number of elements  |
| `view(...)`      | Creates another view of the same data when the layout permits it |
| `stack(...)`     | Combines tensors along a **new** axis                            |
| `squeeze(...)`   | Removes axes of length `1`                                       |
| `unsqueeze(...)` | Adds an axis of length `1`                                       |
| `permute(...)`   | Reorders axes                                                    |

### Reshape

```python
x = torch.arange(1.0, 8.0)
print(x.shape)  # torch.Size([7])

x_reshaped = x.reshape(1, 7)
print(x_reshaped.shape)  # torch.Size([1, 7])
```

Seven numbers remain seven numbers. We've changed their arrangement, not created extra data.

```python
# Also valid: 7 values, rearranged as a column.
print(x.reshape(7, 1).shape)  # torch.Size([7, 1])
```

Trying `x.reshape(2, 7)` would fail because it asks seven existing values to become fourteen. PyTorch is good, but it is not a photocopier.

### View (and a warning about shared storage)

```python
x = torch.arange(1.0, 8.0)
z = x.view(1, 7)

z[:, 0] = 99
print(x[0])  # tensor(99.)
```

The view and original tensor share the same underlying data, so changing the view can change the original. `reshape()` may return a view or a copy depending on the layout; don't rely on it always doing either.

### Stack

```python
x = torch.tensor([1, 2, 3])

rows = torch.stack([x, x, x], dim=0)
columns = torch.stack([x, x, x], dim=1)

print(rows.shape)     # torch.Size([3, 3])
print(columns.shape)  # torch.Size([3, 3])
```

In this equal-sized example, both shapes are `(3, 3)`, but the choice of `dim` changes **which axis is new**. With uneven sizes the orientation becomes easier to spot.

### Squeeze and unsqueeze

```python
x = torch.arange(1.0, 8.0).reshape(1, 7)

print(x.shape)                 # torch.Size([1, 7])
print(x.squeeze().shape)       # torch.Size([7])
print(x.squeeze().unsqueeze(0).shape)  # torch.Size([1, 7])
```

Use `squeeze(dim=...)` if you want to remove a **specific** singleton axis and avoid accidentally removing others.

### Permute: when the image format is wrong

Suppose the image is represented as `[height, width, channels]`:

```python
image = torch.rand(224, 224, 3)
print(image.shape)  # torch.Size([224, 224, 3])
```

A model might expect `[channels, height, width]`. Move the axes around:

```python
image_chw = image.permute(2, 0, 1)
print(image_chw.shape)  # torch.Size([3, 224, 224])
```

`permute()` returns a view with a different axis order; it doesn't change the underlying pixel values. If a subsequent operation requires contiguous storage, you may need `.contiguous()`.

**Image placeholder:** _A pixel cube labeled HWC transforming into CHW, with a caption: “Same pixels. Different paperwork.”_

<!-- IMAGE: ../assets/pytorch-fundamentals/permute-image.png -->

---

## 9. Tensor indexing: getting exactly the number you asked for

If you know Python list slicing or NumPy array indexing, you already know the basic idea.

```python
x = torch.arange(1, 10).reshape(1, 3, 3)
print(x)
```

Our tensor has shape `(1, 3, 3)`:

```text
tensor([[[1, 2, 3],
         [4, 5, 6],
         [7, 8, 9]]])
```

The indices work from the outermost axis inward.

```python
print(x[0])         # The 3x3 matrix inside the outer axis
print(x[0, 0])      # tensor([1, 2, 3])
print(x[0, 1, 1])   # tensor(5)
print(x[:, :, 1])   # Select column index 1, retaining first two axes
print(x[0, 0, :])   # First row of the first matrix
```

The colon `:` means “take every element along this axis.”

For instance, `x[:, :, 1]` means: all outer groups, all rows, and the second column.

This becomes particularly useful when you are selecting image channels, batches, time steps, or features.

> **Rule:** Indexing is not just about finding numbers. It's also about knowing which dimensions your indexing operation keeps or removes.

---

## 10. NumPy and PyTorch: an unlikely but productive friendship

[NumPy](https://numpy.org/) is another popular numerical-computing library. PyTorch can exchange data with it.

### NumPy array → PyTorch tensor

```python
import numpy as np
import torch

array = np.arange(1.0, 8.0)
tensor = torch.from_numpy(array)

print(array)
print(tensor)
print(tensor.dtype)  # Often torch.float64, inherited from NumPy here
```

The dtype matters: NumPy commonly creates `float64` arrays in examples like this, while PyTorch commonly uses `float32` for new floating tensors.

Convert it if needed:

```python
tensor_f32 = tensor.float()
print(tensor_f32.dtype)  # torch.float32
```

### PyTorch tensor → NumPy array

```python
x = torch.ones(7)
array_from_torch = x.numpy()

print(array_from_torch)
print(array_from_torch.dtype)  # float32
```

**Shared memory trap:** `torch.from_numpy(array)` and supported CPU `tensor.numpy()` conversions can share storage with their source. If you modify one **in place**, the other may change too. Operations that allocate new arrays or tensors, such as `array = array + 1`, do not mutate the original shared storage.

If you need an independent copy, make one explicitly (`.copy()` on the NumPy side or `.clone()` on the PyTorch side).

And if the PyTorch tensor lives on a GPU? Move it to the CPU before converting. We'll do that shortly.

---

## 11. Reproducibility: making random numbers behave, for once

Machine learning uses randomness in many places: initial weights, shuffled samples, and simulated data, among others.

That is useful for experimentation, but painful when you want to compare two runs and everything changes.

Let's see the problem:

```python
A = torch.rand(3, 4)
B = torch.rand(3, 4)

print(torch.equal(A, B))  # Usually False
```

Now set a manual seed before generating each tensor:

```python
torch.manual_seed(42)
A = torch.rand(3, 4)

torch.manual_seed(42)
B = torch.rand(3, 4)

print(torch.equal(A, B))  # True
```

A **random seed** makes the pseudo-random sequence reproducible under comparable conditions.

It does **not** guarantee complete reproducibility across every version, device, platform, kernel, or nondeterministic operation. That's why real experiments also track code, dependencies, hardware, and configuration.

If you're also using Python's `random` module or NumPy, seed those separately where appropriate:

```python
import random
import numpy as np

random.seed(42)
np.random.seed(42)
torch.manual_seed(42)
```

In research, this is the difference between “my model reached 94% yesterday” and “I can actually reproduce the run.”

---

## 12. GPU acceleration: moving the chaos to a faster chip

CPU: _I can do math._

GPU: _What if we did a tremendous amount of parallel math?_

PyTorch can use supported GPUs and accelerators for many operations. A GPU often makes large neural-network workloads faster, though small computations can be slower because moving data between devices has overhead.

### CUDA on NVIDIA hardware

```python
import torch

print(torch.cuda.is_available())

if torch.cuda.is_available():
    print("CUDA GPUs detected:", torch.cuda.device_count())
```

If you're in Google Colab and have access to a GPU runtime, you can also run `!nvidia-smi` in a **notebook cell** to view supported NVIDIA GPU information. The `!` prefix is notebook shell syntax, not ordinary Python syntax.

### MPS on Apple Silicon

```python
print(torch.backends.mps.is_available())
```

PyTorch can use the Metal Performance Shaders backend (`mps`) on supported Apple devices.

### Write device-agnostic code

This pattern chooses an available accelerator, falling back to CPU:

```python
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

print("Using:", device)
```

Then move tensors using `.to(device)`:

```python
x = torch.tensor([1, 2, 3])

print("Before:", x.device)
x_on_device = x.to(device)
print("After:", x_on_device.device)
```

The same idea applies to neural-network modules:

```python
model = torch.nn.Linear(2, 6).to(device)
inputs = torch.rand(3, 2).to(device)
outputs = model(inputs)

print(outputs.shape)   # torch.Size([3, 6])
print(outputs.device)
```

**Key point:** The model and its input tensors must normally be on compatible devices. A model living on CUDA and an input tensor living on CPU are not going to cooperate just because you asked nicely.

### Back to NumPy

Ordinary NumPy arrays live in CPU memory, so move a GPU tensor back first. Use `.detach()` as well if the tensor participates in gradient tracking:

```python
numpy_array = outputs.detach().cpu().numpy()
print(numpy_array.shape)  # (3, 6)
```

`.cpu()` returns a CPU tensor; `.numpy()` turns a suitable CPU tensor into a NumPy array. If you are already on CPU, the same expression still works.

**Image placeholder:** _Two workers labeled CPU and GPU; one carefully processes a few numbers, the other carries a ridiculous forklift full of matrix multiplications._

<!-- IMAGE: ../assets/pytorch-fundamentals/cpu-vs-gpu.png -->

---

## 13. A quick combined example: most of the fundamentals in one place

Let's connect a few of these concepts without pretending we're training a giant language model in seven lines.

We'll create a repeatable input tensor, use a linear layer, and inspect the result.

```python
import torch

torch.manual_seed(42)

# Pick an accelerator when available.
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

# 4 samples, each with 3 features.
features = torch.rand(4, 3, device=device)

# Turn 3 input features into 2 output features.
layer = torch.nn.Linear(3, 2).to(device)
predictions = layer(features)

print("Input shape:", features.shape)
print("Output shape:", predictions.shape)
print("Device:", predictions.device)
print("Maximum output:", predictions.max().item())
print("First output row:", predictions[0])
```

What just happened?

1. We set a seed to make random initialization repeatable under similar conditions.
2. We chose a device and made sure the data and layer were on it.
3. Our input had shape `(4, 3)`: four observations and three features each.
4. The linear layer transformed those into shape `(4, 2)`.
5. We inspected the shape, device, maximum value, and first output row.

This is a **forward pass**, not a trained model. The layer hasn't learned anything yet. Its parameters are initialized, and the numbers it outputs are not meaningful predictions about a real task.

Still, you've just exercised much of the machinery that real networks use.

---

## 14. Practice: prove to the tensors that you understand them

Reading code is the tutorial level. Writing code is the boss fight.

Try these exercises before looking at solutions:

1. Read the documentation for [`torch.Tensor`](https://pytorch.org/docs/stable/tensors.html) and [CUDA semantics](https://pytorch.org/docs/stable/notes/cuda.html).
2. Create a random tensor of shape `(7, 7)`.
3. Multiply it by another random tensor with shape `(1, 7)`, transposing the second tensor as needed.
4. Repeat exercises 2–3 with `torch.manual_seed(0)`.
5. Find the CUDA-specific manual seed API and set the CUDA random seed to `1234`, where applicable.
6. Create two random `(2, 3)` tensors with seed `1234` and move them to an available GPU if you have one.
7. Matrix-multiply those two tensors, adjusting the dimensions correctly.
8. Find the minimum and maximum values of that result.
9. Find the indices of its minimum and maximum values.
10. With seed `7`, create a random `(1, 1, 1, 10)` tensor. Remove the singleton dimensions so its shape becomes `(10,)`.

For the original exercise notebook and answers, see the [exercise template](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/extras/exercises/00_pytorch_fundamentals_exercises.ipynb) and [solution notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/extras/solutions/00_pytorch_fundamentals_exercise_solutions.ipynb).

---

## The cheat sheet your future self will thank you for

| Task                           | PyTorch tool                               |
| ------------------------------ | ------------------------------------------ |
| Make a tensor                  | `torch.tensor([...])`                      |
| Random values                  | `torch.rand(...)`                          |
| Fill with zeros / ones         | `torch.zeros(...)` / `torch.ones(...)`     |
| Create a sequence              | `torch.arange(...)`                        |
| Inspect dimensions             | `.ndim`                                    |
| Inspect shape                  | `.shape`                                   |
| Inspect dtype                  | `.dtype`                                   |
| Inspect device                 | `.device`                                  |
| Element-wise multiplication    | `a * b`                                    |
| Matrix multiplication          | `a @ b` or `torch.matmul(a, b)`            |
| Transpose a matrix             | `.T`                                       |
| Minimum / maximum / mean / sum | `.min()` / `.max()` / `.mean()` / `.sum()` |
| Index of smallest / largest    | `.argmin()` / `.argmax()`                  |
| Change dtype                   | `.to(torch.float32)`                       |
| Change shape                   | `.reshape(...)`                            |
| Add or remove length-one axes  | `.unsqueeze(...)` / `.squeeze(...)`        |
| Rearrange axes                 | `.permute(...)`                            |
| Convert NumPy → PyTorch        | `torch.from_numpy(array)`                  |
| Convert PyTorch → NumPy        | `tensor.detach().cpu().numpy()`            |
| Seed PyTorch randomness        | `torch.manual_seed(42)`                    |
| Move tensor to a device        | `.to(device)`                              |

## Part I wrap-up: you survived the tensors

If this article taught you one thing, let it be this:

**Deep learning doesn't begin with intelligence. It begins with putting numbers into the correct shape.**

A tensor isn't magic. A matrix multiplication isn't magic. A GPU isn't magic. But combine numerical representations, trainable parameters, optimization, and enough compute, and you start getting useful models.

Before you build the next revolutionary AI startup, get comfortable answering three questions:

**What shape is my tensor? What dtype is it? What device is it on?**

The tensors will still betray you occasionally. At least now you'll know where to look.

### Further reading and original material

- [Learn PyTorch for Deep Learning — Daniel Bourke](https://www.learnpytorch.io/)
- [Original 00. PyTorch Fundamentals notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/00_pytorch_fundamentals.ipynb)
- [PyTorch Tensor documentation](https://pytorch.org/docs/stable/tensors.html)
- [PyTorch beginner tutorials](https://pytorch.org/tutorials/beginner/basics/intro.html)
- [Original video walkthrough](https://youtu.be/Z_ikDlimN6A?t=76)

_Now go build something. Preferably something that doesn't throw a shape error on the first run. No promises, though._

---

# Part II — The PyTorch Workflow: Teaching Random Numbers to Behave

> **PART 2 OF 4 — WORKFLOW**  
> Create data, build a model, train it, evaluate predictions, and save the learned weights.

Congratulations. You survived tensors, matrix multiplication, and PyTorch's very personal opinions about shapes.

But there is one small issue.

**We haven't actually trained a model yet.**

We've moved numbers around and watched a linear layer produce more numbers. That's useful, but calling it artificial intelligence would be like opening a restaurant because you bought a spoon.

In this second half, we're going to build an entire tiny machine-learning project. No giant dataset. No API keys. No expensive GPU. Just one straight line, two trainable parameters, and an algorithm that slowly learns not to embarrass itself.

> **What you'll build:** A PyTorch regression model that learns the rule `y = 0.7 * x + 0.3` from examples, predicts unseen values, measures its own mistakes, and saves its learned parameters for later.
>
> **Where this comes from:** This part is a reworked, beginner-friendly walkthrough of **Daniel Bourke's [01. PyTorch Workflow Fundamentals](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/01_pytorch_workflow.ipynb)** notebook from [Learn PyTorch](https://www.learnpytorch.io/). The explanations and jokes are adapted for this blog; the learning objectives and central regression exercise follow the supplied notebook.

<!-- IMAGE: ../assets/pytorch-fundamentals/workflow-overview.png -->
<!-- Sketch suggestion: DATA -> MODEL -> PREDICTION -> ERROR -> UPDATE -> REPEAT. A tiny robot says "I am become spreadsheet." -->

---

## 15. First, what's the problem we're trying to solve?

Imagine you're given a few points on a graph. They all seem to follow a straight line, but nobody tells you the rule.

Your job is to discover that rule so you can predict the value of `y` for a new value of `x`.

A straight line can be written as:

$$
y = wx + b
$$

Don't panic. The letters are doing very ordinary jobs:

| Symbol | What it means                           | Our secret answer     |
| ------ | --------------------------------------- | --------------------- |
| `x`    | Input: the number you provide           | e.g. `0.4`            |
| `w`    | Weight: how steep the line is           | `0.7`                 |
| `b`    | Bias: where the line crosses the y-axis | `0.3`                 |
| `y`    | Output: the number we want to predict   | `0.58` when `x = 0.4` |

Here's the arithmetic:

$$
y = 0.7 \times 0.4 + 0.3 = 0.58
$$

We, the people creating this example, know the correct weight and bias. **The model won't be told those values.** It has to infer them from pairs of input and output numbers.

That makes it a controlled experiment: we know what a good answer looks like, so we can check whether training worked.

_Is a straight line the pinnacle of artificial intelligence?_ Absolutely not. It's the tutorial boss before the actual boss fight.

<!-- IMAGE: ../assets/pytorch-fundamentals/straight-line-mystery.png -->
<!-- Sketch suggestion: Points forming a line, unknown w and b in thought bubbles, a detective robot holding a ruler. -->

---

## 16. Prepare the data: give the model something to learn from

Start with PyTorch and Matplotlib. In Google Colab these are often already installed; for a local environment, use the [official PyTorch setup instructions](https://pytorch.org/get-started/locally/) and `python -m pip install matplotlib` if needed.

```python
import torch
from torch import nn
import matplotlib.pyplot as plt

# These are the REAL parameters, known only to us.
weight = 0.7
bias = 0.3

# 0.00, 0.02, 0.04, ..., 0.98 = 50 examples.
X = torch.arange(0, 1, 0.02).unsqueeze(dim=1)
y = weight * X + bias

print("Input shape:", X.shape)   # torch.Size([50, 1])
print("Label shape:", y.shape)   # torch.Size([50, 1])
print("First 3 inputs:\n", X[:3])
print("First 3 labels:\n", y[:3])
```

**Two extremely important words:**

- A **feature** is the information we give the model. Here, `X` is our feature.
- A **label** (or target) is the answer we want the model to predict. Here, `y` is our label.

Why `unsqueeze(dim=1)`? Before it, `X` has shape `(50,)`, one axis with 50 values. After it, `X` has shape `(50, 1)`: 50 rows, one feature each. That shape works naturally with `nn.Linear` later.

### Train/test split: don't give the student the final exam answers

We need to know whether our model can predict inputs it didn't train on.

So we'll use the first **40 examples for training** and the remaining **10 for testing**.

```python
train_split = int(0.8 * len(X))

X_train, y_train = X[:train_split], y[:train_split]
X_test, y_test = X[train_split:], y[train_split:]

print("Training examples:", len(X_train))  # 40
print("Testing examples:", len(X_test))    # 10
```

The distinction is easy:

| Dataset                   | Human analogy           | What the model is allowed to do                         |
| ------------------------- | ----------------------- | ------------------------------------------------------- |
| Training set              | Studying before an exam | Learn and update parameters                             |
| Validation set (optional) | Practice exam           | Help choose settings and compare models                 |
| Test set                  | Final exam              | Evaluate how the chosen model performs on held-out data |

A test set is not a second training set wearing sunglasses. Don't use its answers to update the model.

**Small realism warning:** This is a deliberately simple, noiseless dataset. And because we split it in order, the test inputs are slightly beyond the range of the training inputs. The example is helpful for learning the workflow, but it doesn't prove our model could handle messy real-world data.

### Let's actually look at the numbers

```python
def plot_predictions(predictions=None):
    plt.figure(figsize=(9, 5))
    plt.scatter(X_train, y_train, label="Training data")
    plt.scatter(X_test, y_test, label="Testing data")

    if predictions is not None:
        plt.scatter(
            X_test,
            predictions.detach().cpu(),
            label="Predictions",
            marker="x",
        )

    plt.xlabel("X")
    plt.ylabel("y")
    plt.title("Our tiny straight-line universe")
    plt.legend()
    plt.show()

plot_predictions()
```

Those points are not random noise. They're a straight line because **we made them using a straight-line equation**.

<!-- IMAGE: ../assets/pytorch-fundamentals/train-test-split.png -->
<!-- Sketch suggestion: One line with first 40 points marked TRAIN, last 10 TEST, plus "No peeking at the final exam". -->

---

## 17. Build a model: two parameters and a dream

PyTorch models are often created by subclassing `nn.Module`.

Think of `nn.Module` as a toolbox for building models. You tell it what parts exist and how an input should move through them.

Our first model only needs two learned parameters: a **weight** and a **bias**.

```python
class LinearRegressionModel(nn.Module):
    def __init__(self):
        super().__init__()

        # Random starting guesses; training will adjust these.
        self.weight = nn.Parameter(torch.randn(1))
        self.bias = nn.Parameter(torch.randn(1))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.weight * x + self.bias


torch.manual_seed(42)
model = LinearRegressionModel()

print(model.state_dict())
```

Let's decode the new vocabulary:

- **`nn.Module`** is the base class for our model.
- **`nn.Parameter`** marks a tensor as a trainable parameter (by default, gradients are tracked for it).
- **`forward()`** defines what the model calculates when you call it with input data.
- **`state_dict()`** lets you inspect the model's parameters, which will also be useful for saving them.

When created, `weight` and `bias` are random. The model has not seen a single training example.

Calling it a trained AI model now would be like handing someone a guitar and announcing their world tour.

### Let's check its terrible first guesses

```python
model.eval()

with torch.inference_mode():
    predictions_before = model(X_test)

plot_predictions(predictions_before)
```

The predictions will probably miss the line. **That's expected.** The model hasn't learned the actual weight and bias yet.

And that's the entire point of training: turn bad guesses into better guesses.

<!-- IMAGE: ../assets/pytorch-fundamentals/untrained-model.png -->
<!-- Sketch suggestion: Actual straight line vs badly placed predicted X marks. Robot caption: "Nailed it?" with a skeptical face. -->

---

## 18. Loss and optimizer: the critic and the mechanic

How do we tell a model that its predictions are wrong?

Give it a **loss function**.

How do we help it change its numbers to reduce that loss?

Give it an **optimizer**.

| Tool          | Simple analogy          | Job                                          |
| ------------- | ----------------------- | -------------------------------------------- |
| Loss function | The critic              | Measures how wrong the predictions are       |
| Optimizer     | The mechanic            | Adjusts trainable parameters using gradients |
| Learning rate | Size of each adjustment | Controls how big parameter updates should be |

We'll use **mean absolute error (MAE)**, available as `nn.L1Loss()`.

Imagine the real answers are `[3, 5]` and the predictions are `[4, 8]`.

The errors are `1` and `3`, so their average is:

$$
\mathrm{MAE} = \frac{|3-4| + |5-8|}{2} = 2
$$

Not complicated. Just: _On average, how far off were we?_

```python
loss_fn = nn.L1Loss()
optimizer = torch.optim.SGD(
    params=model.parameters(),
    lr=0.01,
)
```

`SGD` means **stochastic gradient descent**. In this example we'll calculate gradients using our full little training set each epoch; the optimizer is still `torch.optim.SGD`.

`lr=0.01` is the **learning rate**. Think of it as how far the mechanic adjusts things after receiving feedback. Too small, and learning can crawl. Too large, and updates can overshoot or become unstable.

### And what is a gradient?

A gradient tells us **how changing a parameter affects the loss**, locally.

Picture yourself trying to walk downhill in thick fog. You can't see the whole landscape, but you can feel which direction slopes downward.

Gradient descent uses that local slope information to make updates intended to reduce the loss.

Backpropagation is the method PyTorch uses to calculate those gradients through the model's operations.

> **You do not need to calculate derivatives by hand to follow this tutorial.** PyTorch handles automatic differentiation. We are learning the workflow, not trying to impress a calculus textbook.

<!-- IMAGE: ../assets/pytorch-fundamentals/loss-and-gradient.png -->
<!-- Sketch suggestion: Robot on a hillside labelled LOSS, following downhill arrows marked gradients, yelling "smaller error please". -->

---

## 19. The training loop: the five-step ritual

Here is the heartbeat of this little project:

1. **Predict** using the current parameters (`model(X_train)`).
2. **Measure the mistake** (`loss_fn(...)`).
3. **Clear old gradients** (`optimizer.zero_grad()`).
4. **Compute new gradients** (`loss.backward()`).
5. **Update the parameters** (`optimizer.step()`).

Repeat.

Repeat again.

Congratulations, you've discovered a large part of practical machine learning: **use feedback to improve parameters**.

```python
epochs = 300
train_losses = []
test_losses = []

for epoch in range(epochs):
    # TRAIN: learning is allowed here.
    model.train()
    y_pred = model(X_train)
    loss = loss_fn(y_pred, y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # EVALUATE: no parameter updates on test data.
    model.eval()
    with torch.inference_mode():
        test_pred = model(X_test)
        test_loss = loss_fn(test_pred, y_test)

    train_losses.append(loss.item())
    test_losses.append(test_loss.item())

    if epoch % 50 == 0 or epoch == epochs - 1:
        print(
            f"Epoch {epoch:3d} | "
            f"Train loss: {loss.item():.4f} | "
            f"Test loss: {test_loss.item():.4f}"
        )
```

**Epoch** is just a fancy word for one complete pass over the training set. Here we use all 40 training examples in each epoch.

For this toy problem, loss should generally decrease substantially as training proceeds. The exact curve depends on the initial parameters and optimization choices; it doesn't have to decrease perfectly every single step.

### Why do we call `zero_grad()`?

PyTorch normally _accumulates_ gradients. Without clearing them, the next update could include leftovers from previous steps.

Imagine a teacher grading today's homework with yesterday's mistakes added on top. Fair? Not particularly.

### Why use `model.train()` and `model.eval()`?

They select the behavior of certain layers (for example, dropout and batch normalization). Our tiny model has none of those, but it's a good habit for real networks.

### Why wrap testing in `torch.inference_mode()`?

Because we aren't updating parameters during testing. Disabling gradient tracking avoids unnecessary work and helps keep evaluation separate from training.

**One more nuance:** In production projects, you'll often measure progress on a **validation set** and reserve the **test set** for final evaluation. We reuse the test set during this learning demonstration because it matches the introductory workflow, not because repeatedly tuning against your final test set is best practice.

<!-- IMAGE: ../assets/pytorch-fundamentals/training-loop.png -->
<!-- Sketch suggestion: 5-step circular flow: forward -> loss -> zero gradients -> backward -> optimizer; a robot says "again?". -->

---

## 20. Did it learn anything, or is it just confidently wrong?

We know the real values are:

```text
weight = 0.7
bias   = 0.3
```

Let's inspect what the model discovered:

```python
print("Learned parameters:", model.state_dict())
print("True weight:", weight)
print("True bias:", bias)

model.eval()
with torch.inference_mode():
    predictions_after = model(X_test)

plot_predictions(predictions_after)
```

With successful training, the learned weight and bias should get close to the real values. The prediction markers should move near the held-out test points.

Let's visualize the training process as well:

```python
plt.figure(figsize=(9, 5))
plt.plot(train_losses, label="Training loss")
plt.plot(test_losses, label="Test loss")
plt.xlabel("Epoch")
plt.ylabel("Mean absolute error")
plt.title("From random guesses to less-random guesses")
plt.legend()
plt.show()
```

A downward loss curve means the model's numerical errors are generally getting smaller.

It does **not** automatically mean the model is intelligent, fair, reliable in the wild, or ready to sell for a billion dollars.

Our little line has precisely two unknowns and no noise. We picked an easy puzzle on purpose so we could watch the workflow instead of fighting the dataset.

<!-- IMAGE: ../assets/pytorch-fundamentals/before-after-training.png -->
<!-- Sketch suggestion: Two side-by-side plots labelled BEFORE and AFTER; prediction markers far from vs near the true line. -->

---

## 21. Inference: prediction mode, no homework allowed

**Training** means adjusting parameters using data and feedback.

**Inference** means using the model's current parameters to make predictions, without learning from those inputs.

You've already seen this pattern in the code:

```python
model.eval()

with torch.inference_mode():
    prediction = model(torch.tensor([[0.50]]))

print("Prediction for x=0.50:", prediction.item())
print("Expected target:", 0.7 * 0.50 + 0.3)
```

If training went well, those two values should be close.

This is why learning the distinction between `.train()`, `.eval()`, and `torch.inference_mode()` matters. One is about layer behavior; the other is about whether PyTorch tracks gradients for calculations.

They're related, but they're **not interchangeable**.

### Bonus: the CPU/GPU plot twist

Remember Part I's obsession with devices?

If your model and inputs are on different devices, PyTorch will usually complain. For portable code:

```python
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

model = model.to(device)
new_input = torch.tensor([[0.50]], device=device)

model.eval()
with torch.inference_mode():
    device_prediction = model(new_input)

print(device_prediction.detach().cpu().item())
```

The last `.cpu()` brings the result back to the CPU when needed. Tools such as ordinary NumPy and many Matplotlib workflows expect CPU data.

<!-- IMAGE: ../assets/pytorch-fundamentals/training-vs-inference.png -->
<!-- Sketch suggestion: Student robot studying with corrections vs graduate robot answering a question with a fixed notebook. -->

---

## 22. Save and load: because retraining on every restart is embarrassing

Once the model learns something useful, we can save its parameters to disk.

That means you don't need to start training from scratch every time your notebook restarts.

```python
from pathlib import Path

save_path = Path("models") / "linear_regression.pth"
save_path.parent.mkdir(parents=True, exist_ok=True)

torch.save(model.state_dict(), save_path)
print("Saved to:", save_path)
```

We're saving a **`state_dict`**, which contains the module's learned parameters and relevant persistent state, rather than serializing the entire Python model object.

To load it, build an instance of the same model architecture:

```python
reloaded_model = LinearRegressionModel()

# Load only files you trust. A state_dict isn't a substitute
# for normal security practices when handling external files.
reloaded_model.load_state_dict(
    torch.load(save_path, map_location="cpu", weights_only=True)
)

reloaded_model.eval()
with torch.inference_mode():
    reloaded_preds = reloaded_model(X_test.cpu())

print("Matches saved model:", torch.allclose(
    reloaded_preds,
    predictions_after.cpu(),
))
```

**Important device detail:** In our example, `predictions_after` was made before the optional GPU section, so the comparison above should work in a single top-to-bottom run. If you mix and match cells, check devices and rerun the appropriate prediction code.

`weights_only=True` is supported in current PyTorch versions and is a safer default for loading ordinary weight files. Even so, **don't load untrusted model files casually**.

Note that saving weights does _not_ automatically save the original Python class definition, the training dataset, or all your hyperparameters. Keep your model code and experiment settings too.

---

## 23. Everything in one script (a complete mini-project)

The examples above explain each step slowly. Here is a **standalone version** you can paste into one fresh Google Colab cell or a `.py` file. It uses `nn.Linear()` instead of manually creating `nn.Parameter` objects, but it learns the same type of straight-line relationship.

This is the actual payoff: **data → split → model → loss → training → evaluation → save → reload**.

```python
from pathlib import Path
import torch
from torch import nn
import matplotlib.pyplot as plt

# 1. Reproducible initialization, as far as the environment allows.
torch.manual_seed(42)

# 2. Create simple example data.
TRUE_WEIGHT = 0.7
TRUE_BIAS = 0.3
X = torch.arange(0, 1, 0.02).unsqueeze(1)
y = TRUE_WEIGHT * X + TRUE_BIAS

split = int(len(X) * 0.8)
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# 3. Choose the available device.
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

X_train, X_test = X_train.to(device), X_test.to(device)
y_train, y_test = y_train.to(device), y_test.to(device)

# 4. Build a tiny model: one input -> one output.
class TinyLineModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.line = nn.Linear(1, 1)

    def forward(self, x):
        return self.line(x)

model = TinyLineModel().to(device)
loss_fn = nn.L1Loss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 5. Train.
train_history = []
test_history = []

for epoch in range(700):
    model.train()
    prediction = model(X_train)
    loss = loss_fn(prediction, y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    model.eval()
    with torch.inference_mode():
        test_prediction = model(X_test)
        test_loss = loss_fn(test_prediction, y_test)

    train_history.append(loss.item())
    test_history.append(test_loss.item())

    if epoch % 100 == 0 or epoch == 699:
        print(
            f"Epoch {epoch:3d} | train={loss.item():.4f} "
            f"| test={test_loss.item():.4f}"
        )

# 6. Inspect the learned values.
print("\nTrue weight / bias:", TRUE_WEIGHT, TRUE_BIAS)
print("Learned state:", model.state_dict())

# 7. Plot training progress and final predictions.
plt.figure(figsize=(8, 4))
plt.plot(train_history, label="Train loss")
plt.plot(test_history, label="Test loss")
plt.xlabel("Epoch")
plt.ylabel("MAE")
plt.legend()
plt.show()

model.eval()
with torch.inference_mode():
    final_predictions = model(X_test).cpu()

plt.figure(figsize=(8, 4))
plt.scatter(X_train.cpu(), y_train.cpu(), label="Training")
plt.scatter(X_test.cpu(), y_test.cpu(), label="Testing")
plt.scatter(
    X_test.cpu(), final_predictions,
    label="Predictions", marker="x",
)
plt.legend()
plt.show()

# 8. Save learned parameters.
save_path = Path("models/tiny_line_model.pth")
save_path.parent.mkdir(parents=True, exist_ok=True)
torch.save(model.state_dict(), save_path)

# 9. Load them into a new model and verify the result.
loaded_model = TinyLineModel().to(device)
loaded_model.load_state_dict(
    torch.load(save_path, map_location=device, weights_only=True)
)
loaded_model.eval()

with torch.inference_mode():
    loaded_predictions = loaded_model(X_test).cpu()

print("\nReloaded predictions match:",
      torch.allclose(final_predictions, loaded_predictions))
```

If it runs, you built a model, trained it, evaluated it, saved it, and loaded it again.

If it crashes, congratulations: **you have also discovered the authentic machine-learning engineering experience**.

<!-- IMAGE: ../assets/pytorch-fundamentals/complete-workflow.png -->
<!-- Sketch suggestion: An Excalidraw-style checklist with all nine steps ticked, plus a tiny GPU with sunglasses. -->

---

## 24. The mistakes most beginners make (and how to catch them)

| Symptom                                         | Common cause                                      | What to check                                |
| ----------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `mat1 and mat2 shapes cannot be multiplied`     | Wrong tensor shape                                | `X.shape`, `unsqueeze`, layer `in_features`  |
| `Expected all tensors to be on the same device` | Model and data live on different devices          | `.device` for both                           |
| Loss doesn't decrease                           | Wrong learning rate, data, or training-step order | Forward → loss → zero grad → backward → step |
| Predictions change across fresh runs            | Random initialization                             | Seeds, versions, devices, nondeterminism     |
| NumPy/Matplotlib refuses a tensor               | Tensor is on GPU or tracks gradients              | `.detach().cpu()`                            |
| Loaded model behaves unexpectedly               | Wrong class, weights, or eval mode                | Model architecture, `state_dict`, `.eval()`  |

Another very common mistake is judging your model only on the data it studied. A student memorizing the exact homework answers is not the same as a student understanding the topic.

And **lower test loss on this toy line is not proof of general-purpose intelligence**. It's proof the model learned to approximate one very simple numerical relationship.

---

## 25. Your challenge: can you make the model learn a different line?

The source notebook finishes with exercises, and they're worth doing. Reading about training loops is one thing. Writing one without looking is another.

Try this variation:

1. Create at least **100 examples** using `y = 0.3 * x + 0.9`.
2. Split them into **80% training and 20% testing**.
3. Build your own `nn.Module` with a weight and bias (or try `nn.Linear(1, 1)`).
4. Train with `nn.L1Loss()` and `torch.optim.SGD(..., lr=0.01)` for **300 epochs**.
5. Check the loss every 20 epochs, then plot predictions against the true data.
6. Save the `state_dict`, load it into a fresh model, and verify that the predictions match.

**Bonus boss fight:** Change the learning rate to `0.0001`, then to `0.1`. Does training converge more slowly, more quickly, or less reliably? Try plotting the different loss curves.

**Bonus-bonus:** Add random noise to `y` and see why learning real data is harder than learning a perfect straight line.

---

## 26. The cheat sheet for the entire workflow

| Concept         | One-line meaning                           | PyTorch example                        |
| --------------- | ------------------------------------------ | -------------------------------------- |
| Features        | Inputs used to make a prediction           | `X_train`                              |
| Labels          | Correct answers to learn from              | `y_train`                              |
| Model           | Function with learnable parameters         | `nn.Module`                            |
| Weight and bias | Numbers the model learns                   | `nn.Parameter`, `nn.Linear`            |
| Forward pass    | Calculate predictions                      | `model(X_train)`                       |
| Loss            | Measure prediction error                   | `nn.L1Loss()`                          |
| Gradient        | Directional sensitivity of loss            | `loss.backward()`                      |
| Optimizer       | Update model parameters                    | `torch.optim.SGD(...)`                 |
| Learning rate   | Size of optimizer updates                  | `lr=0.01`                              |
| Epoch           | One pass through training data             | `for epoch in range(...)`              |
| Train mode      | Enable training-time layer behavior        | `model.train()`                        |
| Eval mode       | Enable evaluation-time layer behavior      | `model.eval()`                         |
| Inference mode  | Avoid tracking gradients during prediction | `torch.inference_mode()`               |
| Save            | Store learned parameters                   | `torch.save(model.state_dict(), path)` |
| Load            | Restore learned parameters                 | `model.load_state_dict(...)`           |

## Part II wrap-up: the model did not discover consciousness

Here is the real workflow in one sentence:

**Give a model examples, let it predict, measure the mistake, adjust the parameters, and repeat until it performs well enough on data it didn't train on.**

In Part I, we learned to handle the numbers. In Part II, we used those numbers to learn a rule.

That is a much better foundation than memorizing ten thousand buzzwords about AI while being unable to explain why `loss.backward()` exists.

And yes, a trained model might still be wrong.

Unlike your group project's README, the loss function will usually tell you.

### Credits and further learning

- [Learn PyTorch — Daniel Bourke](https://www.learnpytorch.io/)
- [00. PyTorch Fundamentals notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/00_pytorch_fundamentals.ipynb)
- [01. PyTorch Workflow Fundamentals notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/01_pytorch_workflow.ipynb)
- [PyTorch beginner tutorials](https://pytorch.org/tutorials/beginner/basics/intro.html)
- [Saving and loading models](https://pytorch.org/tutorials/beginner/saving_loading_models.html)
- [Neural networks and automatic differentiation](https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)

## _Now go train something. Preferably without accidentally training on your test set._

---

# Part III — PyTorch Classification: Teaching a Neural Network to Pick a Side

> **PART 3 OF 4 — CLASSIFICATION**  
> Binary and multi-class predictions, non-linear decision boundaries, and training real classifiers.

Last time, our model learned to predict a **number**. We gave it an `X`, and it learned to produce a `y` along a straight line.

Very civilized. Very mathematical. Almost suspiciously cooperative.

Now the model has a different job:

> **Given some input, which category does it belong to?**

Is an email spam or not spam? Is an image a cat, dog, or suspiciously cat-shaped loaf of bread? Can we teach a neural network to tell which ring a dot belongs to?

Welcome to **classification**: the part of machine learning where your model learns to pick a label, and we spend the next hour figuring out why it picked the wrong one.

> **What we'll learn in Part III:** binary vs. multi-class vs. multi-label classification; preparing data and shapes; neural network architecture; logits, sigmoid, softmax, and loss functions; why non-linearity matters; complete training loops; accuracy and other metrics; and a second runnable project with multiple classes.

> **Credit:** This continuation is an original, beginner-oriented adaptation of Daniel Bourke's [02. PyTorch Neural Network Classification notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/02_pytorch_classification.ipynb), part of [Learn PyTorch](https://www.learnpytorch.io/). The explanations, jokes, structure, and code below have been rewritten for this article.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/classification-intro.png -->

**Image idea — “AI at the sorting hat ceremony”:** A tiny neural network wearing a wizard hat sorts images into CAT, DOG, and BREAD, visibly panicking at a loaf shaped like a cat.

---

## 27. Regression vs. classification: numbers or labels?

Think back to our previous project. We wanted a model to predict something like:

```text
Input: 0.50
Output: 0.65
```

That is **regression**: predict a numerical value. House prices, temperatures, and delivery times are other common regression tasks.

**Classification** asks a different question:

```text
Input: An email saying “YOU WON 7 MILLION DOLLARS!!!”
Output: SPAM
```

There are three important varieties:

| Type            | What it predicts                         | Everyday example                                 |
| --------------- | ---------------------------------------- | ------------------------------------------------ |
| **Binary**      | One of **two** classes                   | Spam / not spam                                  |
| **Multi-class** | **One** class from three or more choices | Cat / dog / bird                                 |
| **Multi-label** | **Several** classes can apply at once    | A photo tagged `beach`, `sunset`, and `vacation` |

The difference between **multi-class** and **multi-label** is worth remembering. If a photo contains both a cat and a dog, a multi-label system may assign _both_ labels. A typical multi-class system selects just _one_ from its mutually exclusive options.

**The mental model:** Regression answers _“How much?”_ Classification answers _“Which one?”_

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/regression-vs-classification.png -->

**Image idea — “Two AI employees”:** One measures house prices with a calculator; the other sorts messages into SPAM and NOT SPAM. Caption: “Same office, different jobs.”

---

## 28. The classification neural network: same machine, different output

A neural network is made of layers that transform numbers into other numbers. Nothing here has changed since Parts I and II.

The main difference is **how we interpret the output**.

For our dot-on-a-graph project, each dot has two input features: its horizontal position `x1` and vertical position `x2`.

```text
(x1, x2)
    |
    v
[Linear layer]  -> [ReLU] -> [Linear layer] -> [ReLU]
    |
    v
[Final linear layer]
    |
    v
One logit for binary classification
```

A **logit** is a raw model score — not yet a probability. Think of it as an answer draft before the final formatting pass.

For binary classification, a common design outputs **one logit per example**. For four-class classification, a common design outputs **four logits per example**, one for each possible category.

| Design choice                   | Binary example                       | Four-class example                |
| ------------------------------- | ------------------------------------ | --------------------------------- |
| Input features                  | 2                                    | 2                                 |
| Output scores per example       | 1                                    | 4                                 |
| Convert logits to probabilities | `torch.sigmoid`                      | `torch.softmax(..., dim=1)`       |
| Pick class                      | Probability `>= 0.5` means class `1` | Index of highest score (`argmax`) |
| Training loss                   | `nn.BCEWithLogitsLoss()`             | `nn.CrossEntropyLoss()`           |

**Very important:** Both loss functions above expect **raw logits**. Don't apply sigmoid or softmax before feeding outputs to these losses; the loss functions handle the appropriate transformation internally in a numerically stable way.

That one sentence can save you an entire afternoon of debugging.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/classification-architecture.png -->

**Image idea — “The neural network assembly line”:** Two input dots enter a little multi-layer network; it sends one score to a binary classifier and four scores to a four-class classifier.

---

## 29. Meet the dataset: two circles, zero respect for straight lines

For our first classification project, we will generate **1,000 dots arranged in two concentric circles**.

The two labels are simple: `0` for one ring and `1` for the other. You can imagine a target made of two colored rings.

This is a deliberately small, synthetic dataset. It lets us learn the workflow without downloading gigabytes of dog photos.

Install the packages if you need them:

```bash
python -m pip install torch scikit-learn matplotlib
```

In Google Colab, these libraries may already be installed. If not, use `%pip install torch scikit-learn matplotlib` in a notebook cell.

```python
import torch
import matplotlib.pyplot as plt
from torch import nn
from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split

# Generate repeatable data: 1,000 dots, 2 possible labels.
X, y = make_circles(
    n_samples=1000,
    noise=0.03,
    random_state=42
)

print("Features:", X.shape)  # (1000, 2)
print("Labels:", y.shape)    # (1000,)
print("Example:", X[0], "-> class", y[0])

plt.scatter(X[:, 0], X[:, 1], c=y, cmap="coolwarm", s=12)
plt.title("Two circles, two classes")
plt.xlabel("Feature 1")
plt.ylabel("Feature 2")
plt.show()
```

Each dot has **two numbers** describing where it lives on the graph. The label tells us which circle it belongs to.

If you see `X.shape == (1000, 2)`, read it as _“1,000 examples, 2 features each.”_ Nothing supernatural. Just a spreadsheet in disguise.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/two-circles.png -->

**Image idea — “The two-circle challenge”:** Draw two concentric rings of red and blue dots. A puzzled robot holds a ruler and asks, “Can I separate these with one straight line?”

### Split the data before the model sees the answers

If you practice with the final exam answers open, your teacher may be unimpressed. The same applies to training and testing a model.

We will put 80% of the dots into the training set and 20% into the test set. The test set is held back until evaluation.

```python
# Convert NumPy arrays to the correct PyTorch dtypes.
X = torch.tensor(X, dtype=torch.float32)
y = torch.tensor(y, dtype=torch.float32)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Train:", X_train.shape, y_train.shape)
print("Test: ", X_test.shape, y_test.shape)
# Train: (800, 2), (800,)
# Test:  (200, 2), (200,)
```

Why floating-point labels? Our binary loss (`BCEWithLogitsLoss`) expects floating targets such as `0.0` and `1.0` that match its logits' shape.

For the multi-class project later, we'll use **integer** labels instead. Different task, different paperwork.

---

## 30. Why two linear layers can't solve everything

Here comes a deliciously annoying discovery: **stacking linear layers without non-linear activation functions still gives you a linear transformation**.

Suppose we build:

```python
linear_only = nn.Sequential(
    nn.Linear(2, 8),
    nn.Linear(8, 1)
)
```

It has two layers. It has parameters. It has ambitions.

But without a non-linear operation between the layers, it cannot make a curved decision boundary just by stacking those layers. And our circles **need a curved boundary** to separate the rings.

It's like trying to draw a perfect circle using only one infinitely long ruler.

Adding another ruler does not suddenly give the ruler the ability to bend.

### Meet ReLU, the bouncer of negative numbers

A common non-linear activation is **ReLU**, or Rectified Linear Unit:

$$
\operatorname{ReLU}(x) = \max(0, x)
$$

In normal language:

- Positive number? Keep it.
- Negative number? Replace it with zero.

```python
values = torch.tensor([-3.0, -1.0, 0.0, 2.0, 5.0])
print(torch.relu(values))
# tensor([0., 0., 0., 2., 5.])
```

That tiny bend in the math allows networks with enough capacity to learn **non-linear patterns** such as curved boundaries.

ReLU is not magic. It's basically a bouncer saying, _“Negative? Not tonight.”_

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/relu-bouncer.png -->

**Image idea — “ReLU Nightclub”:** Negative numbers get rejected at the door. Positive numbers enter. Next to it, show a straight line becoming a network that can approximate curved boundaries.

---

## 31. Build a real binary classifier (the circles project)

We're going to build a small network with two ReLU hidden layers. Then we'll train it to separate the two circles.

You can run the blocks in this section **in order** after the data preparation above.

```python
# A little reproducibility, as far as the environment allows.
torch.manual_seed(42)

# CPU works perfectly for this tiny demonstration.
# A compatible GPU is optional, not a personality trait.
device = torch.device(
    "cuda" if torch.cuda.is_available() else
    "mps" if torch.backends.mps.is_available() else "cpu"
)

X_train = X_train.to(device)
X_test = X_test.to(device)
y_train = y_train.to(device)
y_test = y_test.to(device)

class CircleClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(2, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )

    def forward(self, x):
        return self.network(x).squeeze(dim=1)

model = CircleClassifier().to(device)
loss_fn = nn.BCEWithLogitsLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

print(model)
```

Let's unpack the network:

- `nn.Linear(2, 16)`: each dot enters with 2 coordinates; the layer produces 16 values.
- `nn.ReLU()`: adds non-linearity, allowing the network to learn more than a straight-line boundary.
- Another `nn.Linear(16, 16)` + ReLU: extra capacity to learn a useful pattern.
- `nn.Linear(16, 1)`: one raw score (a **logit**) for every dot.
- `.squeeze(dim=1)`: changes output shape from `[batch_size, 1]` to `[batch_size]` to match the labels.

So for an input shaped `[800, 2]`, our output has shape `[800]`.

**Watch the shapes, not the vibes.**

### The training loop, now with labels

The steps are still the same ones from Part II:

1. Make predictions (forward pass).
2. Calculate loss.
3. Reset gradients.
4. Backpropagate (`loss.backward()`).
5. Update parameters (`optimizer.step()`).

We also evaluate on the untouched test set, without updating weights.

```python
EPOCHS = 1000

for epoch in range(EPOCHS):
    model.train()
    logits = model(X_train)
    loss = loss_fn(logits, y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch % 200 == 0 or epoch == EPOCHS - 1:
        model.eval()
        with torch.inference_mode():
            test_logits = model(X_test)
            test_loss = loss_fn(test_logits, y_test)

            # For a single binary logit, zero is the
            # same decision cutoff as sigmoid(logit) >= 0.5.
            test_preds = (test_logits >= 0).long()
            test_acc = (
                (test_preds == y_test.long()).float().mean() * 100
            )

        print(
            f"Epoch {epoch:4d} | train loss {loss.item():.4f} | "
            f"test loss {test_loss.item():.4f} | "
            f"test accuracy {test_acc.item():.1f}%"
        )
```

Don't panic if your exact scores differ across versions or devices. What matters is that the model learns a useful separator and performs better than guessing at random on unseen points.

If it doesn't, investigate. The solution is usually a shape, a dtype, a data split, a training setting, or an unrealistic expectation that all models should work perfectly on their first date.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/circles-training-progress.png -->

**Image idea — “Learning to draw a ring”:** Three mini-panels: an untrained model guessing, a half-trained model with a messy curved boundary, and a trained model neatly separating the two circles.

---

## 32. Logits, sigmoid, probabilities: three versions of the same answer

The network's output might look like this:

```text
Raw logit: 2.20
```

That isn't a probability. It's an unrestricted score.

For binary classification, pass it through **sigmoid**:

$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$

This maps any real number to a value between zero and one. For instance, a logit around `2.20` produces a sigmoid output around `0.90`.

```python
example_logit = torch.tensor([2.20])
print(torch.sigmoid(example_logit))  # About tensor([0.9002])
```

A typical decision rule is:

```text
logit → sigmoid → probability → threshold → class
 2.20 →  0.90   →    0.90     →    >=0.5 →  1
-1.10 →  0.25   →    0.25     →     <0.5 →  0
```

In practice, the probability is **the model's score**, not a guarantee that the prediction is correct or well calibrated.

For our model:

```python
model.eval()
with torch.inference_mode():
    raw_logits = model(X_test[:5])
    probabilities = torch.sigmoid(raw_logits)
    predicted_classes = (probabilities >= 0.5).long()

print("Logits:       ", raw_logits)
print("Probabilities:", probabilities)
print("Classes:      ", predicted_classes)
print("True classes: ", y_test[:5].long())
```

One critical rule to tattoo metaphorically onto your debugging notebook:

> Feed **raw logits** into `BCEWithLogitsLoss`. Apply `sigmoid` when you want probabilities for reporting or decisions. Don't apply it twice.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/logits-sigmoid-threshold.png -->

**Image idea — “Three stations”:** A logit goes through a sigmoid machine, becomes a probability, then gets sorted into class 0 or 1 by a tiny bouncer at the 0.5 threshold.

---

## 33. Did the classifier actually learn? Let's visualize it

A number like “97% accuracy” is useful, but it doesn't tell the whole story. A plot of the model's **decision boundary** shows which regions it assigns to class `0` and class `1`.

The trick is simple: make lots of points on a grid, ask the model to classify every point, and color the background according to those predictions.

```python
import numpy as np

model.eval()
with torch.inference_mode():
    # Make a 2D grid around all the example points.
    all_points = torch.cat([X_train, X_test]).cpu().numpy()
    x_min, x_max = all_points[:, 0].min() - 0.3, all_points[:, 0].max() + 0.3
    y_min, y_max = all_points[:, 1].min() - 0.3, all_points[:, 1].max() + 0.3

    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 180),
        np.linspace(y_min, y_max, 180)
    )
    grid = torch.tensor(
        np.c_[xx.ravel(), yy.ravel()], dtype=torch.float32,
        device=device
    )
    grid_probabilities = torch.sigmoid(model(grid))
    regions = (grid_probabilities >= 0.5).cpu().numpy().reshape(xx.shape)

plt.contourf(xx, yy, regions, alpha=0.25, cmap="coolwarm")
plt.scatter(
    X_test[:, 0].cpu(), X_test[:, 1].cpu(),
    c=y_test.cpu(), s=12, cmap="coolwarm", edgecolors="none"
)
plt.title("Binary classifier: test points and decision regions")
plt.xlabel("Feature 1")
plt.ylabel("Feature 2")
plt.show()
```

The ideal plot has one region for the inner circle and another for the outer circle, with some imperfect edges because real data and trained models are not enchanted.

### A trap called overfitting

Imagine the model memorizes the training dots perfectly but struggles with new dots.

That is **overfitting**: doing well on examples it has seen, but failing to **generalize** to fresh examples.

That's why we check performance on a separate test set. If we keep adjusting our model based on test results over and over, we're indirectly tuning to that test set. For serious projects, use a **validation set** during development and save the test set for a final evaluation.

---

## 34. “99% accuracy!” — the sentence that can still be a disaster

Accuracy tells us what fraction of predictions were correct:

$$
\text{Accuracy} = \frac{\text{Correct predictions}}{\text{All predictions}}
$$

If there are 100 spam-free messages and 1 spam message, a lazy classifier that says **“NOT SPAM”** for everything gets 100 out of 101 correct — roughly **99% accuracy** — while missing the only spam message.

The number looks impressive. The model has done almost nothing useful.

Other metrics can help:

| Metric               | Simple interpretation                                   |
| -------------------- | ------------------------------------------------------- |
| **Precision**        | When the model says _positive_, how often is it right?  |
| **Recall**           | Of all the actual positive cases, how many did it find? |
| **F1 score**         | A balance between precision and recall                  |
| **Confusion matrix** | A table showing which classes were confused with which  |

For a binary problem, we can inspect these with scikit-learn:

```python
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix
)

model.eval()
with torch.inference_mode():
    test_predictions = (model(X_test) >= 0).long()

y_true = y_test.long().cpu().numpy()
y_pred = test_predictions.cpu().numpy()

print("Accuracy:", accuracy_score(y_true, y_pred))
print("Confusion matrix:\n", confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred, zero_division=0))
```

A final reminder: the circles dataset is balanced and synthetic. Real-world datasets can have messy data, imbalanced labels, changing patterns, and other problems that a clean tutorial conveniently ignores.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/accuracy-trap-classification.png -->

**Image idea — “99% accurate and still useless”:** A very proud robot marks 100 emails as “not spam,” while a giant flashing spam message slips through behind it.

---

## 35. From two classes to four: the multi-class glow-up

Now we're giving the network **four categories** instead of two.

Remember: in binary classification, we used **one output logit** for two classes. In this multi-class example, we'll use **four output logits**, one per class.

We'll create four clusters of points using scikit-learn's `make_blobs()`.

```python
from sklearn.datasets import make_blobs

NUM_CLASSES = 4
NUM_FEATURES = 2

X_blob, y_blob = make_blobs(
    n_samples=1200,
    n_features=NUM_FEATURES,
    centers=NUM_CLASSES,
    cluster_std=1.5,
    random_state=42
)

X_blob = torch.tensor(X_blob, dtype=torch.float32)
y_blob = torch.tensor(y_blob, dtype=torch.long)

X_blob_train, X_blob_test, y_blob_train, y_blob_test = train_test_split(
    X_blob, y_blob,
    test_size=0.2, random_state=42, stratify=y_blob
)

plt.scatter(
    X_blob_train[:, 0], X_blob_train[:, 1],
    c=y_blob_train, cmap="tab10", s=12
)
plt.title("Four clusters, four possible labels")
plt.show()
```

Notice the labels now use `torch.long` — **integer class indices** like `0`, `1`, `2`, `3`.

Why? Because `nn.CrossEntropyLoss()` expects integer class labels when each example has exactly one correct class.

The model will output four raw scores for each example, so its output shape will be `[batch_size, 4]`.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/four-blobs.png -->

**Image idea — “Four neighborhoods”:** Four colored groups of dots on a map. A robot holds four labeled buckets and says, “Okay, this is at least less circular.”

---

## 36. Build and train the four-class model

This model uses the same familiar parts: linear layers, a non-linearity, a loss function, and an optimizer.

The only important changes are the **number of output units**, the **target dtype**, and the **loss function**.

```python
torch.manual_seed(42)

X_blob_train = X_blob_train.to(device)
X_blob_test = X_blob_test.to(device)
y_blob_train = y_blob_train.to(device)
y_blob_test = y_blob_test.to(device)

class FourClassClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(2, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, 4)   # Four raw class scores
        )

    def forward(self, x):
        return self.network(x)

multi_model = FourClassClassifier().to(device)
multi_loss_fn = nn.CrossEntropyLoss()
multi_optimizer = torch.optim.Adam(multi_model.parameters(), lr=0.01)

for epoch in range(300):
    multi_model.train()
    logits = multi_model(X_blob_train)
    loss = multi_loss_fn(logits, y_blob_train)

    multi_optimizer.zero_grad()
    loss.backward()
    multi_optimizer.step()

    if epoch % 75 == 0 or epoch == 299:
        multi_model.eval()
        with torch.inference_mode():
            test_logits = multi_model(X_blob_test)
            predictions = test_logits.argmax(dim=1)
            test_accuracy = (
                (predictions == y_blob_test).float().mean() * 100
            )
        print(
            f"Epoch {epoch:3d} | train loss {loss.item():.4f} | "
            f"test accuracy {test_accuracy.item():.1f}%"
        )
```

### Softmax: making a probability distribution from class scores

For an example with four raw logits, we can apply **softmax** to get four non-negative scores that add up to approximately 1:

```python
multi_model.eval()
with torch.inference_mode():
    logits = multi_model(X_blob_test[:3])
    probabilities = torch.softmax(logits, dim=1)
    labels = probabilities.argmax(dim=1)

print("Logits shape:", logits.shape)        # (3, 4)
print("Probabilities:\n", probabilities)
print("Row sums:", probabilities.sum(dim=1))  # Approximately [1, 1, 1]
print("Predicted labels:", labels)
print("Actual labels:   ", y_blob_test[:3])
```

`dim=1` means _“normalize across the class scores for each sample.”_

You may also notice:

```python
# The most likely class is unchanged by softmax.
raw_choice = logits.argmax(dim=1)
softmax_choice = torch.softmax(logits, dim=1).argmax(dim=1)
print(torch.equal(raw_choice, softmax_choice))  # True
```

So when you only need the predicted label, you can skip softmax and take `argmax` of the logits directly.

But when reporting class probabilities, softmax gives you normalized scores. Those are **not automatically well-calibrated probabilities** of being correct.

And yes, **`CrossEntropyLoss` takes logits directly**, not your already-softmaxed probabilities. This is the multi-class version of our earlier sigmoid warning.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/softmax-pizza-vote.png -->

**Image idea — “Four-class election”:** A model presents four raw scores for CAT, DOG, PIZZA, and BIRD. Softmax turns them into four percentages adding to 100%; argmax crowns the winner.

---

## 37. Binary vs. multi-class: the cheat sheet you will actually use

| Question                              | Binary classification        | Multi-class classification     |
| ------------------------------------- | ---------------------------- | ------------------------------ |
| How many classes?                     | 2                            | 3 or more                      |
| Final output size                     | Usually 1 logit per sample   | 1 logit per class per sample   |
| Label dtype                           | `torch.float32`              | `torch.long`                   |
| Typical output shape                  | `[N]` or `[N, 1]`            | `[N, C]`                       |
| Loss function                         | `nn.BCEWithLogitsLoss()`     | `nn.CrossEntropyLoss()`        |
| Convert output to probabilities       | `torch.sigmoid(logits)`      | `torch.softmax(logits, dim=1)` |
| Choose class                          | Compare with threshold `0.5` | `logits.argmax(dim=1)`         |
| Need to apply activation before loss? | **No**                       | **No**                         |

And because this table is dangerously useful, here's an extra one for the common problems you will eventually encounter:

| Symptom                                    | What to check first                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Loss complains about a shape mismatch      | Are logits and labels shaped compatibly?                                             |
| Binary loss complains about label dtype    | Are binary labels floats?                                                            |
| Cross-entropy complains about targets      | Are multi-class labels integer indices?                                              |
| Model predicts one class for everything    | Class balance, gradients, learning rate, and data quality                            |
| Training improves but test accuracy drops  | Possible overfitting; check data splitting and validation                            |
| Test accuracy stays around random guessing | Features, model capacity, loss/labels, and whether training actually updates weights |
| CUDA/device errors                         | Are data, labels, and model on the same device?                                      |

The three universal debugging questions from Part I still apply: **shape, dtype, device**. They have not retired. They have merely acquired additional responsibilities.

---

## 38. Mini-challenges: now the model is your problem

Try these after running the two complete projects:

1. **Remove both ReLUs** from the circles classifier and train again. What changes in the learned boundary and test accuracy?
2. Change the circles classifier's hidden width from `16` to `4`, then to `64`. Does bigger always mean better?
3. Change the learning rate from `0.01` to `0.1`, then to `0.001`. Which converges faster or more reliably?
4. Increase `noise` in `make_circles()` from `0.03` to `0.15`. What happens when the rings become harder to separate?
5. In the four-class model, change `NUM_CLASSES` to `5` **and update the final layer** to output five scores. What breaks if you forget?
6. Print a confusion matrix for the four-class model. Which classes get confused most often?
7. Try a separate validation split so you can tune your settings without peeking at the final test set.

**Bonus boss fight:** Generate a [spiral dataset](https://cs231n.github.io/neural-networks-case-study/) and try classifying it. It's a fun way to discover that even small, harmless-looking datasets can give a neural network a very bad day.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/classification-boss-fight.png -->

**Image idea — “The three bosses”:** Stage 1 = line, Stage 2 = circles, Stage 3 = spirals. A tiny neural network advances from holding a ruler to carrying a sword labeled ReLU.

---

## Part III wrap-up: your neural network can finally make decisions

We started by teaching a model to predict a straight line. Now it can learn to put points into categories.

The biggest lessons:

- **Regression predicts numbers; classification predicts categories.**
- **Shapes and labels matter as much as the model architecture.**
- **Non-linear activations** like ReLU let neural networks learn curved or more complex patterns.
- **Binary classification:** one logit, `BCEWithLogitsLoss`, sigmoid for probabilities, threshold for a class.
- **Multi-class classification:** one logit per class, `CrossEntropyLoss`, softmax for probabilities, argmax for a class.
- **Testing on unseen data** matters. So do the right metrics, especially when classes are imbalanced.

You now understand the ingredients behind a very large number of real classification systems. That doesn't mean every problem is solved — but you can identify the pieces, train a working model, and debug it when the outputs look like an abstract art project.

### Further reading for Part III

- [Learn PyTorch — Daniel Bourke](https://www.learnpytorch.io/)
- [Original 02. PyTorch Neural Network Classification notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/02_pytorch_classification.ipynb)
- [PyTorch: BCEWithLogitsLoss](https://pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html)
- [PyTorch: CrossEntropyLoss](https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)
- [Scikit-learn: make_circles](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_circles.html)
- [Scikit-learn: make_blobs](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_blobs.html)

_Now go teach a model to distinguish cats from dogs. If it calls your cat a loaf of bread, at least it has a promising career in memes._

---

# Part IV — PyTorch Computer Vision: Teaching a GPU to Judge Your Outfit

> **PART 4 OF 4 — COMPUTER VISION**  
> FashionMNIST, image tensors, convolutional networks, and visual model evaluation.

Part I taught us to survive tensors. Part II taught a model to learn a straight line. Part III taught it to pick between classes of dots.

Now we're giving it **actual images**.

Specifically: tiny pictures of clothes. Because after spending several chapters doing linear algebra, the obvious next career move for our neural network is **fashion critic**.

In this part, you'll build three image classifiers: a basic linear model, a slightly smarter model with ReLU, and a **convolutional neural network (CNN)**. You'll learn how images become tensors, why batches exist, how convolutions work, how to compare models, and how to discover which clothes your AI keeps confusing.

> **Source and credit:** This section is an original, condensed, joke-heavy adaptation of Daniel Bourke's [03. PyTorch Computer Vision](https://www.learnpytorch.io/03_pytorch_computer_vision/) lesson and [notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/03_pytorch_computer_vision.ipynb). The explanation and compact example below are rewritten for this blog. The model-comparison demo also adds a **validation split**, so we don't use final test data as our tuning playground.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-cover.png -->

_Image idea — “AI Fashion Week”: a tiny robot with a clipboard examining a pixelated sneaker. Caption: “I have 60,000 pictures and no sense of style.”_

## 39. Computer vision: when your numbers start looking like pictures

**Computer vision** means getting computers to extract useful information from images or video. It's not the same as human vision; a model sees numerical pixel values and learns patterns from examples.

Some of the main jobs are:

| Task                           | The question                        | Example                          |
| ------------------------------ | ----------------------------------- | -------------------------------- |
| **Binary classification**      | Is it A or B?                       | Cat or dog?                      |
| **Multi-class classification** | Which ONE category fits?            | Sneaker, sandal, boot, or shirt? |
| **Object detection**           | What is present, and where?         | Find the cars in a street photo. |
| **Segmentation**               | Which pixels belong to which thing? | Outline every person in a photo. |

We'll focus on **multi-class image classification**. For each image, we want **one label**.

That is an important limitation: the model in this tutorial does **not** draw bounding boxes, segment objects, or recognize arbitrary real-world photos. It only learns to choose among ten FashionMNIST categories.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-tasks.png -->

_Image idea — Four simple panels: one label; ten possible labels; a box around an object; a pixel mask. Caption: “Same image. Different homework.”_

## 40. Meet FashionMNIST: 70,000 tiny outfits, zero fashion advice

We'll use [FashionMNIST](https://github.com/zalandoresearch/fashion-mnist), created by Zalando Research. It contains **60,000 training images** and **10,000 test images** of clothing and accessories in **ten categories**.

Each picture is **28 × 28 pixels**, **grayscale**. That's only `784` pixel values, not a high-resolution photo worthy of a phone advertisement.

The labels are:

| ID  | Class       | ID  | Class      |
| --- | ----------- | --- | ---------- |
| 0   | T-shirt/top | 5   | Sandal     |
| 1   | Trouser     | 6   | Shirt      |
| 2   | Pullover    | 7   | Sneaker    |
| 3   | Dress       | 8   | Bag        |
| 4   | Coat        | 9   | Ankle boot |

Let's load the dataset. Run these cells in order in **Google Colab** or a local Python environment with compatible PyTorch and Torchvision versions. In Colab, PyTorch is usually preinstalled; for a local setup, follow the [official PyTorch installation instructions](https://pytorch.org/get-started/locally/).

```python
import torch
from torch import nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
from pathlib import Path
from time import perf_counter

SEED = 42
torch.manual_seed(SEED)

transform = transforms.ToTensor()

train_full = datasets.FashionMNIST(
    root="./data", train=True, download=True, transform=transform
)
test_data = datasets.FashionMNIST(
    root="./data", train=False, download=True, transform=transform
)

class_names = train_full.classes
print("Full training set:", len(train_full))  # 60000
print("Final test set:", len(test_data))      # 10000
print("Classes:", class_names)
```

`ToTensor()` changes the images into PyTorch tensors with values from `0` to `1`. It isn't turning a sneaker into wisdom. It is turning image intensity into numbers the network can work with.

The initial dataset download needs internet access. After the files are cached locally, you can reuse them.

## 41. Image shapes: the return of our oldest enemy

Try inspecting one sample:

```python
image, label = train_full[0]
print("Image shape:", image.shape)  # torch.Size([1, 28, 28])
print("Label:", label, class_names[label])
print("Pixel min/max:", image.min().item(), image.max().item())

plt.imshow(image.squeeze(0), cmap="gray")
plt.title(class_names[label])
plt.axis("off")
plt.show()
```

Why is the shape `[1, 28, 28]`?

- **`1`** is the channel count. This image has just one channel because it is grayscale.
- **`28`** is the height in pixels.
- **`28`** is the width in pixels.

If it were a regular RGB image, you'd often see **`[3, H, W]`**, one channel each for red, green, and blue.

Real models usually receive **batches** of images. For example, a batch of 32 FashionMNIST samples has shape:

```text
[32, 1, 28, 28]
  |  |   |   |
  |  |   |   +-- width
  |  |   +------ height
  |  +---------- channels
  +------------- number of images (batch size)
```

This convention is called **NCHW**: Number, Channels, Height, Width. Some other pipelines store images in another order, such as NHWC. Don't guess. **Check the shape.** Your future self will send you a thank-you email.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-tensor-shape.png -->

_Image idea — A 28×28 grayscale shirt image turns into a grid of decimal numbers. A stack of 32 copies appears with the label `[32, 1, 28, 28]`. Caption: “Your photo has become a spreadsheet.”_

## 42. DataLoader: feeding the model without throwing 60,000 images at it

Rather than load every image into a model at once, PyTorch's `DataLoader` gives us manageable **mini-batches**.

A batch is like a tray of 64 cookies. You don't eat the entire bakery in one bite. Unless you are a GPU with unusually ambitious VRAM.

For this beginner demo we'll train on **12,000** images and validate on a separate **2,000**, both selected from the official 60,000-image training split. This makes Colab/CPU experiments friendlier. We will keep the official 10,000-image test set untouched until the final evaluation.

```python
# Shuffle indices once, then use disjoint training/validation subsets.
g = torch.Generator().manual_seed(SEED)
indices = torch.randperm(len(train_full), generator=g)
train_indices = indices[:12_000].tolist()
val_indices = indices[12_000:14_000].tolist()

train_data = Subset(train_full, train_indices)
val_data = Subset(train_full, val_indices)

BATCH_SIZE = 64
train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False)
test_loader = DataLoader(test_data, batch_size=BATCH_SIZE, shuffle=False)

images, labels = next(iter(train_loader))
print("One batch:", images.shape)     # [64, 1, 28, 28]
print("Labels:", labels.shape)        # [64]
```

**Training set:** teaches the model. **Validation set:** helps us compare and select models. **Test set:** gets one final, relatively unbiased evaluation after we've finished selecting our approach.

If you repeatedly use the test set to change hyperparameters, it stops being a genuine final exam. You have, academically speaking, peeked at the answer sheet.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-batches.png -->

_Image idea — 64 little image tiles on a conveyor belt entering a neural network; the other 59,936 photos wait in line. Caption: “Please form an orderly batch.”_

## 43. Model 0: flatten everything and hope for the best

Let's build a **baseline**. A baseline is your first simple solution. You build it before inventing a 90-layer architecture with a name inspired by Greek mythology.

`nn.Flatten()` turns each image from `[1, 28, 28]` into `[784]` pixel values. Then linear layers produce **10 output scores**, one for each clothing category.

```python
class FashionBaseline(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, 64),
            nn.Linear(64, 10),
        )

    def forward(self, x):
        return self.network(x)

baseline = FashionBaseline()
with torch.inference_mode():
    scores = baseline(images[:4])
print(scores.shape)  # [4, 10]
```

**What are these ten scores?** They're called **logits**: raw model outputs, not probabilities.

And yes, there are _two_ linear layers. But without a non-linear activation between them, their combined effect is still just another linear transformation. The extra layer does not unlock secret curved-pattern powers.

It's like stacking two transparent rulers and calling it an architectural revolution.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-flatten-baseline.png -->

_Image idea — Image `[1,28,28]` → flattened row of 784 numbers → linear layers → ten numbered boxes. Caption: “Completely ignored the fact it was a picture.”_

## 44. Training loop: forward, complain, correct, repeat

We've already learned this in Part II, but now our labels are **categories** rather than continuous numbers.

We'll use:

- **`nn.CrossEntropyLoss()`** to measure how badly the model's class scores disagree with the correct class indices.
- **`torch.optim.Adam`** to update the parameters using gradients.
- **`argmax(dim=1)`** to select the highest-scoring category.

**Important:** Pass **raw logits** to `CrossEntropyLoss`. It handles the relevant log-softmax computation internally. Don't apply softmax first and then pass the probabilities into this loss unless you have a carefully justified reason to change the setup.

Let's write reusable training and evaluation functions. They'll work for all three models.

```python
if torch.cuda.is_available():
    device = torch.device("cuda")
elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")
print("Training on:", device)

loss_fn = nn.CrossEntropyLoss()

def train_one_epoch(model, loader, optimizer):
    model.train()
    loss_total = 0.0
    correct = 0
    seen = 0

    for x_batch, y_batch in loader:
        x_batch = x_batch.to(device)
        y_batch = y_batch.to(device)

        logits = model(x_batch)             # Forward pass
        loss = loss_fn(logits, y_batch)     # How wrong?
        optimizer.zero_grad()               # Clear old gradients
        loss.backward()                     # Calculate gradients
        optimizer.step()                    # Update parameters

        batch_size = y_batch.size(0)
        loss_total += loss.item() * batch_size
        correct += (logits.argmax(1) == y_batch).sum().item()
        seen += batch_size

    return loss_total / seen, correct / seen

@torch.inference_mode()
def evaluate(model, loader):
    model.eval()
    loss_total = 0.0
    correct = 0
    seen = 0

    for x_batch, y_batch in loader:
        x_batch = x_batch.to(device)
        y_batch = y_batch.to(device)
        logits = model(x_batch)

        batch_size = y_batch.size(0)
        loss_total += loss_fn(logits, y_batch).item() * batch_size
        correct += (logits.argmax(1) == y_batch).sum().item()
        seen += batch_size

    return loss_total / seen, correct / seen
```

Why `model.train()` and `model.eval()`? Some layers (such as dropout and batch normalization) behave differently during training and evaluation. Our small examples don't depend on them, but using the correct mode is still a good habit.

Why `torch.inference_mode()`? We don't need to track gradients just to check how well the model is doing. We already have enough things using RAM.

## 45. Model 1: add ReLU, because a ruler cannot draw every curve

Here's a more useful modification: insert **ReLU** between the linear layers.

Recall from Part III:

\[
\operatorname{ReLU}(x) = \max(0, x)
\]

Anything below zero becomes zero. Anything above zero stays as it is. Simple rule, surprisingly powerful effect: it gives the network **non-linear behavior**.

```python
class FashionMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, 64),
            nn.ReLU(),
            nn.Linear(64, 10),
        )

    def forward(self, x):
        return self.network(x)
```

This is a basic **multi-layer perceptron (MLP)**. It still flattens images immediately, so it doesn't explicitly preserve the two-dimensional neighborhood structure of pixels. A shirt's sleeve being next to its body is helpful information; flattening doesn't give the model special tools for local patterns.

Time to hire someone who actually looks at nearby pixels.

## 46. Model 2: CNNs, or the art of staring at tiny squares

A **convolutional neural network (CNN)** processes an image with small learned filters, also called **kernels**.

Think of a little `3 × 3` window moving across a picture. Instead of staring at every pixel independently, a convolution can notice **local patterns** like edges, corners, and textures. Deeper layers can combine simpler patterns into more useful ones.

It does not literally receive a hard-coded instruction to find shirt collars. The filters start with learnable weights and are adjusted by training.

**Convolution:** scan local neighborhoods and produce feature maps.

**ReLU:** add non-linearity.

**Max pooling:** shrink spatial dimensions by keeping the largest value in each small neighborhood.

For FashionMNIST, a very small CNN is enough to demonstrate the idea:

```python
class FashionCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(16, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),                    # 28x28 -> 14x14
            nn.Conv2d(16, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(16, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),                    # 14x14 -> 7x7
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(16 * 7 * 7, 10),
        )

    def forward(self, x):
        return self.classifier(self.features(x))

cnn = FashionCNN()
with torch.inference_mode():
    print("After convolution blocks:", cnn.features(images[:4]).shape)
    print("Final logits:", cnn(images[:4]).shape)
    # [4, 16, 7, 7] then [4, 10]
```

Let's decode `nn.Conv2d(1, 16, kernel_size=3, padding=1)`:

- **`1` input channel:** our images are grayscale.
- **`16` output channels:** we learn 16 different filter sets, creating 16 feature maps.
- **`kernel_size=3`:** the local window is `3 × 3`.
- **`padding=1`:** add a one-pixel border so a stride-one convolution keeps the same height and width.

Two pooling operations halve the image size each time: `28 → 14 → 7`. With 16 feature maps left, the classifier receives `16 × 7 × 7 = 784` numbers.

Notice the number 784 returned. It missed us and came back.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-convolution.png -->

_Image idea — A little 3×3 square scanning a pixelated shirt, generating a feature map. Caption: “Enhance! But, like, mathematically.”_

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-cnn-shapes.png -->

_Image idea — `[1,28,28]` → Conv + ReLU → `[16,28,28]` → MaxPool → `[16,14,14]` → Conv + ReLU → MaxPool → `[16,7,7]` → Flatten → 10 logits. Keep it clean, black ink, red accents._

## 47. The three-model tournament: may the best pixels win

Let's train the baseline, the ReLU model, and the CNN using **the same training subset and validation subset**.

The demo uses **three epochs per model** to keep things approachable. An **epoch** means one pass through the training dataset. Three passes do not guarantee a model has reached its best performance; this is a teaching experiment, not a leaderboard submission.

```python
EPOCHS = 3
models = {
    "Linear baseline": FashionBaseline(),
    "ReLU MLP": FashionMLP(),
    "Small CNN": FashionCNN(),
}

results = {}

for name, model in models.items():
    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.003)
    start = perf_counter()

    print(f"\n=== {name} ===")
    for epoch in range(EPOCHS):
        train_loss, train_acc = train_one_epoch(
            model, train_loader, optimizer
        )
        val_loss, val_acc = evaluate(model, val_loader)
        print(
            f"Epoch {epoch + 1}/{EPOCHS} | "
            f"train acc: {train_acc:.1%} | "
            f"validation acc: {val_acc:.1%}"
        )

    elapsed = perf_counter() - start
    results[name] = {
        "validation_accuracy": val_acc,
        "validation_loss": val_loss,
        "seconds": elapsed,
    }

print("\nModel comparison:")
for name, result in results.items():
    print(
        f"{name:16s} | "
        f"val acc: {result['validation_accuracy']:.1%} | "
        f"time: {result['seconds']:.1f}s"
    )
```

**Don't copy imaginary accuracy numbers into your blog.** The final results depend on your exact hardware, environment, training choices, and random initialization. Run the code and report what _actually_ happens.

And don't be surprised if one model is slower. CNNs do more structured image processing. More accurate **sometimes** means more computation; faster **sometimes** means less accuracy. But neither outcome is guaranteed.

This comparison is only a small experiment: one run per architecture, a limited dataset subset, and a few epochs. For fairer conclusions, use multiple random seeds and compare parameters, memory, accuracy, and runtime.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-model-showdown.png -->

_Image idea — Three contenders in a boxing ring: “Flatten + Linear”, “MLP + ReLU”, “CNN”. The judge holds a validation accuracy scorecard (with blank scores to fill after running)._

## 48. Probability vs. prediction: which shoe does it believe in?

For each image, our model emits ten **logits**. To convert them into normalized class probabilities, apply **softmax**:

```python
best_name = max(
    results,
    key=lambda name: results[name]["validation_accuracy"]
)
best_model = models[best_name]
print("Selected using validation accuracy:", best_name)

best_model.eval()
with torch.inference_mode():
    one_image, actual_label = test_data[0]
    logits = best_model(one_image.unsqueeze(0).to(device))
    probabilities = torch.softmax(logits, dim=1)[0]
    predicted_label = probabilities.argmax().item()

print("True label:", class_names[actual_label])
print("Predicted:", class_names[predicted_label])
print("Top score:", f"{probabilities[predicted_label].item():.1%}")
```

**Why `unsqueeze(0)`?** One image has shape `[1, 28, 28]`. Models are expecting a batch dimension: `[1, 1, 28, 28]`.

Also: a softmax result of `0.91` isn't automatically proof that the model is correct **91% of the time when it says 0.91**. Neural networks can be overconfident. Probability _calibration_ is a separate question.

## 49. Final exam: the untouched test set

We've picked a model using the **validation** split. Now, and only now, run the final test evaluation:

```python
test_loss, test_accuracy = evaluate(best_model, test_loader)
print(f"Final test accuracy: {test_accuracy:.1%}")
print(f"Final test loss: {test_loss:.4f}")
```

This tells us how the selected model performs on images it didn't see during training or model selection. It doesn't prove it will work on phone-camera selfies of shoes, new product photos, or satellite images. **FashionMNIST is not the entire visible universe.**

## 50. Confusion matrix: the model's personal embarrassment report

Accuracy tells us the total percentage of correct guesses. But **which** labels get confused?

For instance, a network might distinguish bags from trousers fairly well, but mix up shirts, pullovers, and coats. A **confusion matrix** makes those errors visible.

Rows represent **true** labels; columns represent **predicted** labels. Values on the diagonal are correct guesses. Values elsewhere show errors.

```python
# Collect predictions from the selected model.
all_true = []
all_pred = []

best_model.eval()
with torch.inference_mode():
    for x_batch, y_batch in test_loader:
        logits = best_model(x_batch.to(device))
        preds = logits.argmax(dim=1).cpu()
        all_true.append(y_batch.cpu())
        all_pred.append(preds)

true_labels = torch.cat(all_true)
pred_labels = torch.cat(all_pred)

# Row = true class, column = predicted class.
num_classes = len(class_names)
flat_indices = true_labels * num_classes + pred_labels
confusion = torch.bincount(
    flat_indices, minlength=num_classes ** 2
).reshape(num_classes, num_classes)

plt.figure(figsize=(9, 8))
plt.imshow(confusion.numpy(), cmap="Blues")
plt.colorbar(label="Number of images")
plt.xticks(range(num_classes), class_names, rotation=65, ha="right")
plt.yticks(range(num_classes), class_names)
plt.xlabel("Predicted label")
plt.ylabel("True label")
plt.title(f"FashionMNIST confusion matrix — {best_name}")
plt.tight_layout()
plt.show()
```

Imagine 100 actual shirts. If 20 land in the _pullover_ column, the model has a shirt-versus-pullover problem, even if its overall accuracy looks respectable.

That's actionable feedback. You could inspect misclassified examples, try more training data, improve preprocessing, or test a better architecture.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-confusion-matrix.png -->

_Image idea — A simple 3×3 toy confusion matrix with diagonal cells highlighted and an arrow to an off-diagonal error: “Bro, that's a shirt, not a coat.” Clearly mark it as illustrative, not actual experiment results._

## 51. Save the best model: because training twice is not a personality trait

When we're done, save the model's learned parameters to disk. The file is small compared with a dataset or a full training environment.

```python
model_path = Path("models") / "fashionmnist_best_state_dict.pth"
model_path.parent.mkdir(parents=True, exist_ok=True)

torch.save(best_model.state_dict(), model_path)
print("Saved:", model_path)

# Recreate the same architecture, then restore its parameters.
restored_model = type(best_model)().to(device)
restored_model.load_state_dict(
    torch.load(model_path, map_location=device, weights_only=True)
)
restored_model.eval()

with torch.inference_mode():
    sample = one_image.unsqueeze(0).to(device)
    original = best_model(sample)
    restored = restored_model(sample)

print("Predictions match:", torch.allclose(original, restored))
```

`state_dict()` saves the parameters, **not** the Python class definition, so you must still have the same model architecture available when reloading.

Only load model files you trust. Even with safer loading options, external model files and code deserve the same caution as any other downloaded software artifact.

## 52. Common computer-vision mistakes, presented as a support group

| Symptom                                         | Probable issue                                   | First thing to check                               |
| ----------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `Expected 4D input`                             | CNN got no batch dimension                       | Use `[N,C,H,W]`; try `unsqueeze(0)` for one sample |
| `mat1 and mat2 shapes cannot be multiplied`     | Flattened feature count doesn't match `Linear`   | Print intermediate shapes                          |
| `Expected all tensors to be on the same device` | Mixed CPU/GPU tensors                            | Move model, images, and labels to the same device  |
| Accuracy stays near random guessing             | Training, labels, learning rate, or model issues | Inspect a batch and verify parameters are updating |
| Training high, validation low                   | Overfitting                                      | Try more data, regularization, or a smaller model  |
| `CrossEntropyLoss` complains                    | Invalid label type/shape                         | Use integer class indices and raw logits           |
| Clothing labels seem randomly shuffled          | Class-to-index mismatch                          | Check `class_names` and dataset targets            |

**The debugging holy trinity is still:** shape, dtype, device.

New honorary member: **does this image even look like what I think it looks like?** Plot your data before blaming CUDA, your optimizer, or Mercury in retrograde.

## 53. Mini-challenges: the FashionMNIST boss level

Try these once your three models run:

1. Switch from the quick 12,000-image training subset to the full **60,000** training examples, while retaining a separate validation set. Does accuracy improve? How much does training slow down?
2. Increase the number of CNN filters from `16` to `32`, then fix the final linear layer's input size. Do you improve performance or just heat up your laptop?
3. Change `EPOCHS` from `3` to `5`. Does training accuracy improve while validation accuracy stalls?
4. Remove one pooling layer. Print the output shapes. Why does `nn.Linear(16 * 7 * 7, 10)` no longer match?
5. Plot **ten incorrectly predicted test images**, showing the real label and the predicted label. Look for patterns in the failures.
6. Compare a **CPU** run with a **GPU** run, if available. Was the GPU actually faster for your workload?
7. Try **three different random seeds** and report the average and variation in validation accuracy. One lucky run is not a scientific breakthrough.

<!-- IMAGE PLACEHOLDER: ../assets/pytorch-fundamentals/vision-boss-fight.png -->

_Image idea — A three-level retro game: “Flattening”, “ReLU”, “CNN”. Final boss: a shirt that looks suspiciously like a coat. Caption: “100% confidence. 0% drip.”_

---

## Part IV wrap-up: your AI can now identify tiny clothes

We went from vectors of numbers to tensors of pixels, from linear models to a convolutional network, and from one accuracy score to understanding **which mistakes** our models make.

The real lessons are straightforward:

- **Images are tensors**, often with shape `[N, C, H, W]`.
- **`DataLoader`** feeds examples in batches.
- A **baseline** gives you something honest to beat.
- **ReLU** adds non-linearity; **convolutions** learn local visual features.
- **Validation** is for model selection. **Testing** is for the final evaluation.
- A **confusion matrix** tells you which classes your model confuses.
- **`state_dict()`** lets you save learned weights and reload them into the same architecture.

You have now built three generations of image classifiers. None has an artistic opinion. All of them are capable of being embarrassingly wrong about a T-shirt.

And that, arguably, is the most realistic introduction to modern AI.

### Further reading for Part IV

- [Learn PyTorch — 03. PyTorch Computer Vision](https://www.learnpytorch.io/03_pytorch_computer_vision/)
- [Original 03. PyTorch Computer Vision notebook](https://github.com/mrdbourke/pytorch-deep-learning/blob/main/03_pytorch_computer_vision.ipynb)
- [FashionMNIST dataset](https://github.com/zalandoresearch/fashion-mnist)
- [PyTorch Torchvision datasets](https://pytorch.org/vision/stable/datasets.html)
- [PyTorch Conv2d reference](https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html)
- [PyTorch DataLoader reference](https://pytorch.org/docs/stable/data.html)
- [CNN Explainer](https://poloclub.github.io/cnn-explainer/)

_Next time the model calls your sneaker a sandal, inspect the confusion matrix before filing a complaint with the GPU._
