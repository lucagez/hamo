import test from 'ava';
import hamo from '../dist/hamo';

const asyncFunc = async (a, b) => a + b;

test('Should return a promise when starting in async mode', (t) => {
  const [sum] = hamo(asyncFunc, true);

  t.assert(typeof sum(1, 2).then === 'function');
});

test('Can await promised function', async (t) => {
  const [sum] = hamo(asyncFunc, true);

  t.is(await sum(1, 2), 3);
});
