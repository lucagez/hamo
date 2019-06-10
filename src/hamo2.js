
const every = funcs => (...args) => {
  const { length } = funcs;
  for (let i = 0; i < length; i++) {
    funcs[i](...args);
  }
};

function on(when, func) {
  this.queues[when] = [
    ...this.queues[when] || [],
    func
  ];

  this.switchHandler();
  console.log(this.handler.toString());
}

function off(when) {
  this.queues[when] = undefined;

  this.switchHandler();
  console.log(this.handler.toString());
}

function wrapper() {
  const [beforeQ, afterQ] = ['before', 'after']
    .map(queue => [
      ...this.queues[`once${queue}`] || [],
      ...this.queues[queue] || [],
    ]);

  const oncebeforeFLAG = typeof this.queues.oncebefore !== 'undefined';
  const onceafterFLAG = typeof this.queues.onceafter !== 'undefined';

  return (...args) => {
    // BEFORE
    every(beforeQ)(...args);
    if (oncebeforeFLAG) this.queues.oncebefore = undefined;

    // MIDDLE
    const result = this.func(...args);

    // AFTER
    // (microtask executed on nextTick)
    // NOTE: using Promise for keeping browser compatibility.
    Promise
      .resolve()
      .then(() => {
        every(afterQ)(result);
        if (onceafterFLAG) this.queues.onceafter = undefined;
      });

    // MIDDLE
    return result;
  };
}


// function build() {
//   // QUEUES
//   const { before, oncebefore, after, onceafter } = this.queues;

//   const any = oncebefore || before || after || onceafter;

//   // The body of the final handler
//   let body = '';

//   // Dynamically building handler body;
//   if (oncebefore) {
//     body += `this.every(this.queues.oncebefore)(...arguments);`;
//     body += `this.queues.oncebefore = [];`;
//   }

//   if (before) {
//     body += `this.every(this.queues.before)(...arguments);`;
//   }

//   if (any) {
//     body += `const result = this.func(...arguments);`;
//   }

//   if (after || onceafter) {
//     body += `Promise.resolve().then(() => {`;
//     if (onceafter) {
//       body += `this.every(this.queues.onceafter)(result);`;
//       body += `this.queues.onceafter = [];`;
//     }
//     if (after) {
//       body += `this.every(this.queues.after)(result);`;
//     }
//     body += `});`;
//   }

//   if (any) {
//     body += `return result;`;
//   }

//   // Adding conditions to keep optimized function when there are no
//   // defined hooks.
//   return body.length > 0 && new Function(body);
// }

function switchHandler() {
  const { before, oncebefore, after, onceafter } = this.queues;
  const flag = oncebefore || before || after || onceafter;

  this.handler = flag
    ? this.wrap
    : this.func;
}

function hamo(func) {
  this.queues = {};

  // Hooked function
  this.func = func;

  // Dyanmically builded handler.
  // NOTE: it is initialized to `func` to be of ZERO overhead
  // when a function has no hooks.
  this.handler = this.func;

  this.wrap = wrapper.bind(this);
  this.switchHandler = switchHandler.bind(this);

  // Dynamically build the body of the handler function.
  // this.build = build.bind(this);
  this.every = every.bind(this);

  return [
    (...args) => this.handler(...args),
    on,
    off,
  ];
}


module.exports = hamo;
