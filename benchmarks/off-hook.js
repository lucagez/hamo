const { Suite } = require('benchmark');
const hamo = require('../dist/hamo');

const suite = new Suite();

/**
 * You clearly incur in a performance overhead when attaching
 * hooks to a function.
 * However, when detaching the hooks, the hooked performance
 * is 100% as the non-hooked one.
 */

const normal = (a, b) => a + b;
const [hooked, onHooked, offHoked] = hamo(normal);

onHooked('before', () => 'before hook');
offHoked('before');

suite
  .add('normal', () => {
    normal(1, 2);
  })
  .add('de-hooked', () => {
    hooked(1, 2);
  })
  .on('cycle', event => console.log(String(event.target)))
  .run();
