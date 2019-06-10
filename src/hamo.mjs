/**
 * Internal function that execute every function in an array passing
 * the same set of arguments.
 * @param {array} funcs - array of function that needs to be executed 
 * @param  {any} args - arguments passed to array funcs
 */
const every = (funcs = [], ...args) => {
  const { length } = funcs;
  for (let i = 0; i < length; i++) {
    funcs[i](...args);
  }
};

/**
 * Concatenating function to be used on defined hook.
 * @param {string} when - one of `before`, `after`, `oncebefore`, `onceafter` 
 * @param {function} func 
 */
function on(when, func) {
  this.queues[when] = [
    ...this.queues[when] || [],
    func
  ];

  this.handler = this.build();
}

/**
 * Clear hook's queue relative to passed `when`.
 * @param {string} when - one of `before`, `after`, `oncebefore`, `onceafter` 
 */
function off(when) {
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
 * NOTE: because of scheduled micro-task, the flow of the resulting function is:
 * 1. ONCE BEFORE
 * 2. BEFORE
 * 3. MIDDLE (hooked function)
 * 4. return result of the hooked function
 * 5. ONCE AFTER
 * 6. AFTER
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
 * Hamo, it's latin for `hook`.
 * 
 * @param {function} func 
 */
function hamo(func) {
  this.queues = {};

  // Hooked function
  this.func = func;

  // Dyanmically builded handler.
  // Hamo starts using the provided function as the
  // used handler => start with no overhead.
  // Adding overhead only if hooks are defined.
  // If all queues are cleared at any point in time, the handler will
  // be the original function again.
  this.handler = this.func;

  // Dynamically build the body of the handler function.
  this.build = build.bind(this);
  this.every = every.bind(this);

  // Returning the handler function and the `on` / `off` modifiers
  return [
    (...args) => this.handler(...args),
    on,
    off,
  ];
}

// class Hamo {
//   constructor(func) {
//     this.queues = {};
  
//     // Hooked function
//     this.func = func;
  
//     // Dyanmically builded handler.
//     // Hamo starts using the provided function as the
//     // used handler => start with no overhead.
//     // Adding overhead only if hooks are defined.
//     // If all queues are cleared at any point in time, the handler will
//     // be the original function again.
//     this.handler = this.func;
  
//     // Dynamically build the body of the handler function.
//     this.build = build.bind(this);
//     this.every = every.bind(this);
  
//     // Returning the handler function and the `on` / `off` modifiers
//     return [
//       (...args) => this.handler(...args),
//       on.bind(this),
//       off.bind(this),
//     ];
//   }
// }

export default hamo;
