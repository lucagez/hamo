const { Suite } = require('benchmark');
const hamo = require('../dist/hamo');

const suite = new Suite();

/**
 * Testing the basic hooked func from Hamo.
 * When attaching no hooks, the resulting function is **exactly**
 * the provided function.
 * So, there are NO preformance drawbacks in using it.
 */

// `hooked` is exactly like `normal`
const normal = (a, b) => a + b;
const [hooked] = hamo(normal);

suite
  .add('normal', () => {
    normal(1, 2);
  })
  .add('hooked', () => {
    hooked(1, 2);
  })
  .on('cycle', event => console.log(String(event.target)))
  .run();
