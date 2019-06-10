const every = funcs => () => {
  // Using arguments for squeezing performance
  for (let i = 0; i < arguments.length; i++) {
    funcs[i](...arguments);
  }
};

function on(when) {
  // Using args on non critical function
  return function scoped(...args) {
    const [a, b] = args;
    let once;
    let func = a;

    // In once function is more convenient to pass the before/after
    // solution before the function. To keep the ability of define the function in place.
    // => More convenient syntax.
    if (typeof a === 'string') {
      // oncebefore || onceafter
      if (a !== 'before' || a !== 'after') throw new Error(`Undefined timing ${a}`);
      once = `once${a}`;
      func = b;
    }

    const id = once || when;
    const actual = Array.from(
      this.queues.get(id) || [],
    );
    const queue = [...actual, func];

    this.queues.set(id, queue);
  };
}

function wrapper(method) {
  return function scoped(...args) {
    // BEFORE
    every(this.beforeQ.get(method) || [])(...args);

    // AFTER
    // (microtask executed on nextTick)
    // NOTE: using Promise for keeping browser compatibility.
    let execution;
    Promise
      .resolve()
      // Passing both the args used for the method invocation and the result of the method
      .then(() => every(this.afterQ.get(method) || [])(...args, execution));

    // MIDDLE
    return (() => {
      // Computing the result and saving it in a ariable that will be picked up
      // during AFTER execution.

      // NOTE: the wrapper function will return the result before
      // starting the after queue.
      const result = this[`_${method}`](...args);
      execution = result;
      return result;
    })();
  };
}

// Base body. Used when no queues are defined.
// If no hooks are needed, the resulting hamo function will
// execute the original function with zero overhead.
// => Simply return the original function's result
const base = 'return func(...arguments)';

// everySTR returns the execution of `every` function in a `when` queue.
// e.g. Adding to the final body `everySTR('before')`, will add to the
// final handler the hook `before` the actual function execution.
const everySTR = when => `every(this.queues.get(${when}))(...arguments);`;

// The `once` queue is simply a queue that gets cleared every time it is invoked.
const clearOnceSTR = when => `this.queues.set(once${when}, []);`;

const afterSTR = handler => `Promise.resolve().then(() => {${handler}});`;

// // QUEUES
// const before = this.queues.get('before');
// const oncebefore = this.queues.get('oncebefore');
// const after = this.queues.get('after');
// const onceafter = this.queues.get('onceafter');

function builder(before, oncebefore, after, onceafter) {
  // The body of the final handler
  let body = '(function scoped() {';
  // let body = '';

  // Dynamically building handler body;
  if (before) {
    body += `every(this.queues.get('before'))(...arguments);`;
    if (oncebefore) {
      body += `every(this.queues.get('oncebefore'))(...arguments);`;
      body += `this.queues.set('oncebefore', []);`;
    }
  }

  if (after) {
    body += `const result = this.func(...arguments);`
    body += `Promise.resolve().then(() => {`;
    if (onceafter) {
      body += `every(this.queues.get('onceafter'))(result);`;
      body += `this.queues.set('onceafter', []);`;
    }
    body += `every(this.queues.get('after'))(result);`;
    body += `});`

    body += `return result;`
  } else {
    body += `return this.func(...arguments);`;
  }

  body += `})`;

  return body;
}

function* makeId() {
  let index = 0;
  while (true) {
    yield index++;
  }
}

function hamo(func) {

  // On first execution all queues are undefined.
  // So, if no hooks are instantiated, the returned function is
  // the most optimized one (in term of speed and overhead).
  this.func = func;
  this.store = {};
  this.queues = new Map();

  this.current = eval(builder()).bind(this);
  this.current.queues = 'lol'
  // current.func = func;
  // current.before = on('before').bind(current);
  // current.after = on('after').bind(current);
  // current.once = on().bind(current);
  // current.builder = builder.bind(current);

  // console.log(current.prototype);
  
  const id = Symbol();
  this.store[id] = this.current;
  
  setTimeout(() => {
    this.store[id] = a => a + 'gay';
  }, 10);

  return [
    (...args) => this.store[id].handler(...args),
    id,
  ];
}

hamo.prototype.queues = 'lol';

// class Hamo {
//   constructor(func) {
//     this.func = func;
//     this.queues = new Map();
//     this.before = on('before').bind(this);
//     this.after = on('after').bind(this);
//     this.once = on().bind(this);
//     this.builder = builder.bind(this);

//     this.current = new Function(builder());
//     this.current.prototype.before = 'lol'

//     return this.current.bind(this);
//   }
// }

module.exports = hamo;
