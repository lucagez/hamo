# Hamo
> Hāmo, from latin: `hooked`. 
> ZERO overhead hooks.

# Synopsis
`Hamo` provides a handy interface for attaching `before / after / once` hooks to any function without zero overhead.
Fully compatible with both Node and the browser.

# How it works

The hooked function is dynamically builded during runtime.
Only the pieces relative to the currently active hooks are added to the hooked function body.
When no hooks are attached to the hooked function, the original function is used.

To invoke the `after` hooks **really** after the hooked function has already returned,
a micro-task is scheduled by running the hooks inside an already resolved promise.

# TOC
  * [Installation](#installation)
  * [Usage](#usage)
    * [Getting started](#getting-started)
    * [Possible hooks](#possible-hooks)
    * [Define a hook](#define-a-hook)
    * [Before and oncebefore](#before-and-oncebefore)
    * [After and onceafter](#after-and-onceafter)
    * [Detach hook](#detach-hook)
    * [Hooking async functions](#hooking-async-functions)
  * [Benchmarks](#benchmarks)
  * [Test](#test)
  * [License](#license)


# Installation

```bash
npm install hamo --save
```

If not using a bundler:
```html
<script src="https://unpkg.com/hamo"></script>
```

# Usage

The `hamo` function accepts `2` arguments:
1. function to be hooked.
2. async flag (specify if the provided function is async or not).
   
It returns an array of `3` elements:
1. `hooked`.
2. `on`, function used to attach hooks to hooked.
3. `off`, function used to detach hooks from hooked.

A suggested naming could be `[function]`, `on[function]`, `off[function]`:
```bash
const [func, on, off] = hamo(function, async);
```

## Getting started

Basic example of hooking a function. The `sum` function is exactly the function passed as argument to `hamo`.

```javascript
const hamo = require('hamo');

const [sum] = hamo((a, b) => a + b);

sum(1, 2); // 3
```

## Possible hooks

The existent hooks are:
- `before`
- `oncebefore`
- `after`
- `onceafter`

## Define a hook

A hook can be defined passing to the `on` function two arguments:
1. Argument that define the timing of the hook (`hookString`).
2. Hook function (`hookFunction`).

```bash
on(hookString, hookFunction)
```

```javascript
const [sum, onSum] = hamo((a, b) => a + b);

onSum('before', () => console.log('Called before!'));

sum(1, 2);

// Called before
// 3

```

## Before and oncebefore

`before` and `oncebefore` hooks gets called before the function execution.
Those functions are feeded with the same set of arguments that is passed to the hooked function.

**NOTE:** `oncebefore` Is called only one time.

```javascript
const [sum, onSum] = hamo((a, b) => a + b);

onSum('before', (a, b) => console.log(`Summing ${a} and ${b}`));

sum(1, 2);

// Summing 1 and 2
// 3

```

## After and onceafter

`before` and `onceafter` hooks gets called after the function execution.
Those functions are feeded with the **result** of the hooked function AND with the same set of arguments that is passed to the hooked function.


**NOTE:** `onceafter` Is called only one time.
**NOTE1:** These functions are invoked after the function has returned.

```javascript
const [sum, onSum] = hamo((a, b) => a + b);

onSum('after', (res, a, b) => console.log(`Sum is equal to ${res}`));

sum(1, 2);

// 3
// Sum is equal to 3

```

## Detach hook

A previously defned hook is detachable by invoking the `off` function with the `hookString` argument

```bash
off(hookString);
```


**NOTE:** `onceafter` Is called only one time.
**NOTE1:** These functions are invoked after the function has returned.

```javascript
const [sum, onSum, offSum] = hamo((a, b) => a + b);

onSum('after', (res, a, b) => console.log(`Sum is equal to ${res}`));

offSum('after');

sum(1, 2);

// 3

```

## Hooking async functions

It's possible to hook async functions.
Example of hoking `fs`.


```javascript
const { readFile } = require('fs');
const { promisify } = require('util');

// Specify the async flag
const [read, onRead] = hamo(promisify(readFile), true);

onRead('after', (file, path) => console.log(`Finished reading from ${path}`));

read('./test.txt', 'utf-8');

// ... test.txt ...
// Finished reading from ./test.txt

```

# Benchmarks

To run benchmarks:
- clone repo.
- `npm install`
- run files inside `/benchmarks`.

# Test

To run tests:
- clone repo
- `npm install`
- `npm test`

# License

**MIT**

