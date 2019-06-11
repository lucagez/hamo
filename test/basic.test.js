import test from 'ava';
import hamo from '../dist/hamo';

test('Exports three functions when initialized', (t) => {
  const [a, b, c] = hamo(() => '');

  t.assert(typeof a === 'function');
  t.assert(typeof b === 'function');
  t.assert(typeof c === 'function');
});

test('Throws if anything that is not a function is passed', (t) => {
  const throw0 = () => hamo();
  const throw1 = () => hamo('1');
  const throw2 = () => hamo(2);

  t.throws(throw0);
  t.throws(throw1);
  t.throws(throw2);
});

test('Should execute original function', (t) => {
  const [sum] = hamo((a, b) => a + b);
  t.is(sum(1, 2), 3);
});
