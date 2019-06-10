/**
 * Internal function that execute every function in an array passing
 * the same set of arguments.
 * @param {array} funcs - array of function that needs to be executed 
 * @param  {any} args - arguments passed to array funcs
 */
var every = function (funcs) {
  if ( funcs === void 0 ) funcs = [];
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var length = funcs.length;

  for (var i = 0; i < length; i++) {
    funcs[i].apply(funcs, args);
  }
};
/**
 * Concatenating function to be used on defined hook.
 * @param {string} when - one of `before`, `after`, `oncebefore`, `onceafter` 
 * @param {function} func 
 */


function on(when, func) {
  this.queues[when] = (this.queues[when] || []).concat( [func]);
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
 */


function build() {
  // QUEUES
  var ref = this.queues;
  var before = ref.before;
  var oncebefore = ref.oncebefore;
  var after = ref.after;
  var onceafter = ref.onceafter;
  var any = oncebefore || before || after || onceafter;
  var body = '';
  /**
   * BEFORE
   */

  if (oncebefore) {
    body += "this.every(this.queues.oncebefore, ...arguments);";
    body += "this.queues.oncebefore = undefined;";
  }

  if (before) {
    body += "this.every(this.queues.before, ...arguments);";
  }
  /**
   * MIDDLE
   * Executing actual function after the `before` queue.
   */


  if (any) {
    body += "const result = this.func(...arguments);";
  }
  /**
   * AFTER
   * (microtask executed on nextTick)
   * NOTE: using Promise for browser compatibility.
   */


  if (after || onceafter) {
    body += "Promise.resolve().then(() => {";

    if (onceafter) {
      body += "this.every(this.queues.onceafter, result, ...arguments);";
      body += "this.queues.onceafter = undefined;";
    }

    if (after) {
      body += "this.every(this.queues.after, result, ...arguments);";
    }

    body += "});";
  }

  if (any) {
    body += "return result;";
  } // Adding conditions to keep using original function 
  // when there are no defined hooks.


  return body.length > 0 ? new Function(body) : this.func;
}
/**
 * Hamo, it's latin for `hook`.
 * 
 * @param {function} func 
 */


function hamo(func) {
  var this$1 = this;

  this.queues = {}; // Hooked function

  this.func = func; // Dyanmically builded handler.
  // Hamo starts using the provided function as the
  // used handler => start with no overhead.
  // Adding overhead only if hooks are defined.
  // If all queues are cleared at any point in time, the handler will
  // be the original function again.

  this.handler = this.func; // Dynamically build the body of the handler function.

  this.build = build.bind(this);
  this.every = every.bind(this);
  return [function () {
    var ref;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    return (ref = this$1).handler.apply(ref, args);
  }, on, off];
}

module.exports = hamo;
//# sourceMappingURL=hamo.js.map
