/**
 * Internal function that execute every function in an array passing
 * the same set of arguments.
 * @param {array} funcs - array of function that needs to be executed 
 * @param  {any} args - arguments passed to array funcs
 */
const every = (funcs = [], ...args) => {
  const { length } = funcs;
  for (let i = 0; i < length; i++) {
    new Promise(() => funcs[i](...args));
  }
};

function validator(...args) {
  // Using args to reuse validator on both handlers.
  // args[0] is always `when`
  // args[1], when invoking `on`, is a function.
  if (['oncebefore', 'before', 'after', 'onceafter'].indexOf(args[0]) < 0) {
    throw new Error(`Undefined timing ${args[0]}`);
  }

  if (args[1] && typeof args[1] !== 'function') {
    throw new TypeError('Hook must be of type function');
  }
}

/**
 * Concatenating function to be used on defined hook.
 * @param {string} when - one of `before`, `after`, `oncebefore`, `onceafter` 
 * @param {function} func 
 */
function on(when, func) {
  validator(when, func);

  this.queues[when] = [
    ...this.queues[when] || [],
    func
  ];

  // rebuilding the handler on every on / off call
  // => Always use the most optimized function.
  this.handler = this.build();
}

/**
 * Clear hook's queue relative to passed `when`.
 * @param {string} when - one of `before`, `after`, `oncebefore`, `onceafter` 
 */
function off(when) {
  validator(when);
  
  this.queues[when] = undefined;

  this.handler = this.build();
}

/**
 * Dynamically buiilding the body of the handler.
 * Building this optimized function lead to 100x performance improvement
 * against an already defined handler with if statements.
 * This function will composed only the actually used hooks.
 * Adding a lot less overhead.
 * If `any` is FALSE (meaning no hooks used) => the normal function is
 * passed.
 * The function is built on each hook/dehook.
 * 
 * NOTE1: because of scheduled micro-task, the flow of the resulting function is:
 * 1. ONCE BEFORE
 * 2. BEFORE
 * 3. MIDDLE (hooked function)
 * 4. return result of the hooked function
 * 5. ONCE AFTER
 * 6. AFTER
 * 
 * NOTE2: The `this` keyword inside build is referring to `state` object.
 */
function build() {
  // QUEUES
  const { before, oncebefore, after, onceafter } = this.queues;

  const any = oncebefore || before || after || onceafter;

  let body = '';

  /**
   * BEFORE
   */
  if (oncebefore) {
    body += `this.every(this.queues.oncebefore, ...arguments);`;
    body += `this.queues.oncebefore = undefined;`;
  }

  if (before) {
    body += `this.every(this.queues.before, ...arguments);`;
  }

  /**
   * MIDDLE
   * Executing actual function after the `before` queue.
   */
  if (any) {
    body += `const result = this.func(...arguments);`;
  }

  /**
   * AFTER
   * (microtask executed on nextTick)
   * NOTE: using Promise for browser compatibility.
   */
  if (after || onceafter) {
    body += `Promise.resolve().then(() => {`;
    if (onceafter) {
      body += `this.every(this.queues.onceafter, result, ...arguments);`;
      body += `this.queues.onceafter = undefined;`;
    }
    if (after) {
      body += `this.every(this.queues.after, result, ...arguments);`;
    }
    body += `});`;
  }

  if (any) {
    body += `return result;`;
  }

  // Adding conditions to keep using original function 
  // when there are no defined hooks.
  return body.length > 0
    ? new Function(body)
    : this.func;
}

/**
 * Hāmo, from latin. `hooked`.
 * ZERO overhead hooks for every function.
 * @param {function} func 
 */
const hamo = (func) => {
  const state = {
    // stored queues
    queues: {},

    // Hooked function
    func,
    
    // Dyanmically builded handler.
    // Hamo starts using the provided function as the
    // used handler => start with no overhead.
    // Adding overhead only if hooks are defined.
    // If all queues are cleared at any point in time, the handler will
    // be the original function again.
    handler: func,

    // Dynamically build the body of the handler function.
    build,

    // Utility to call an array of function with the same set of arguments
    every,
  };

  // Returning the handler function and the `on` / `off` modifiers
  return [
    (...args) => state.handler(...args),
    on.bind(state),
    off.bind(state),
  ];
}

module.exports = hamo;
