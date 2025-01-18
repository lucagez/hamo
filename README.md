# 🎣 Hamo
> Hāmo, from latin: `hooked`. 
> ZERO overhead hooks.

<p>
  <a href="https://travis-ci.org/lucagez/hamo.svg?branch=master"><img src="https://travis-ci.org/lucagez/hamo.svg?branch=master" alt="travis"></a>
  <img src="https://img.shields.io/badge/license-MIT-f1c40f.svg" alt="MIT">
</p>

# Deprecation

> 🚨 This repo is archived 🚨

Ownership of the npm namespace for `hamo` has been transferred to [clementroche](https://github.com/clementroche) who is building amazing packages. Peace ✌️


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

## Multiple hooks

Multiple hooks of the same type can be defined.
Every hook of the same type will be executed with the same set of argument.

```javascript
const [sum, onSum] = hamo((a, b) => a + b);

onSum('before', () => console.log('Called before than the next before!'));
onSum('before', () => console.log('Called before than the func!'));

sum(1, 2);

// Called before than the next before
// Called before than the func
// 3

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


```javascript
const sleepFunc = ms => new Promise(resolve => setTimeout(resolve, ms));

// Specify the async flag
const [sleep, onSleep] = hamo(sleepFunc, true);

onSleep('after', (ms) => console.log(`Just slept for ${ms}ms`));

(async () => {
  await sleep(1000);
})();

// ( sleeping )
// Just slept for 1000ms

```

# Real World Examples

## Hooking `fs`

Example of hooking `fs`.


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

# Hooking React components

Example of hooking a React component and logging on different rendering stages.

```jsx
const HelloComponent = ({ who }) => {
  console.log('Rendering component');
  
  return <h1>Hello {who}</h1>;
};

const [Hello, onHello] = hamo(HelloComponent);

onHello('before', ({ who }) => console.log(`Rendering hello component with prop ${who}`));

onHello('after', () => console.log('Rendered hello component'));

React.render(<Hello who="world" />, '#App');

// Rendering hello component with prop world
// Rendering component
// ( Now the component is rendered in the dom )
// Rendered hello component

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

