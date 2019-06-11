import test from 'ava';
import hamo from '../dist/hamo';

test('BEFORE should execute before hooked function', (t) => {
  const values = [];

  const [push, onPush] = hamo(() => values.push('hooked'));

  onPush('before', () => values.push('before'));
  push();

  t.deepEqual(values, ['before', 'hooked']);
});

test('ONCEBEFORE should execute before hooked function', (t) => {
  const values = [];

  const [push, onPush] = hamo(() => values.push('hooked'));

  onPush('oncebefore', () => values.push('oncebefore'));
  push();

  t.deepEqual(values, ['oncebefore', 'hooked']);
});

test('AFTER should execute after hooked function', (t) => {
  const values = [];

  const [push, onPush] = hamo(() => values.push('hooked'));

  onPush('after', () => values.push('after'));
  push();

  return new Promise((resolve) => {
    setTimeout(() => {
      t.deepEqual(values, ['hooked', 'after']);
      resolve();
    }, 0);
  });
});

test('ONCEAFTER should execute after hooked function', (t) => {
  const values = [];

  const [push, onPush] = hamo(() => values.push('hooked'));

  onPush('onceafter', () => values.push('onceafter'));
  push();

  return new Promise((resolve) => {
    setTimeout(() => {
      t.deepEqual(values, ['hooked', 'onceafter']);
      resolve();
    }, 0);
  });
});

test('AFTER should schedule a micro-task and execute after hooked returns', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('after', value => values.push(value));
  const result = sum(1, 2);

  t.is(result, 3);
  t.assert(typeof values[0] === 'undefined');

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values[0], 3);
      resolve();
    }, 0);
  });
});

test('ONCEAFTER should schedule a micro-task and execute after hooked returns', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('onceafter', value => values.push(value));
  const result = sum(1, 2);

  t.is(result, 3);
  t.assert(typeof values[0] === 'undefined');

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values[0], 3);
      resolve();
    }, 0);
  });
});
