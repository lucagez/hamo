import test from 'ava';
import hamo from '../dist/hamo';

test('ON should throw if hooking undefined timing', (t) => {
  const [, onSum] = hamo((a, b) => a + b);

  const throw0 = () => onSum('alter');
  const throw1 = () => onSum('belfore');

  t.throws(throw0);
  t.throws(throw1);
});

test('ON should throw if hooking non function', (t) => {
  const [, onSum] = hamo((a, b) => a + b);

  const throw0 = () => onSum('after', 'a');
  const throw1 = () => onSum('before', 3);

  t.throws(throw0);
  t.throws(throw1);
});

test('OFF should throw if hooking undefined timing', (t) => {
  const [, , offSum] = hamo((a, b) => a + b);

  const throw0 = () => offSum('alter');
  const throw1 = () => offSum('belfore');

  t.throws(throw0);
  t.throws(throw1);
});

test('Generated function should be valid after adding BEFORE hook', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);
  onSum('before', () => '');

  t.is(sum(1, 2), 3);
});

test('Generated function should be valid after adding AFTER hook', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);
  onSum('after', () => '');

  t.is(sum(1, 2), 3);
});

test('Generated function should be valid after adding ONCEBEFORE hook', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);
  onSum('oncebefore', () => '');

  t.is(sum(1, 2), 3);
});

test('Generated function should be valid after adding ONCEAFTER hook', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);
  onSum('onceafter', () => '');

  t.is(sum(1, 2), 3);
});

test('BEFORE hook gets executed', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('before', () => values.push(0));
  sum(1, 2);

  t.is(values[0], 0);
});

test('AFTER hook gets executed', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('after', () => values.push(0));
  sum(1, 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values[0], 0);
      resolve();
    }, 0);
  });
});

test('ONCEBEFORE hook gets executed', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('oncebefore', () => values.push(0));
  sum(1, 2);

  t.is(values[0], 0);
});

test('ONCEAFTER hook gets executed', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('onceafter', () => values.push(0));
  sum(1, 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values[0], 0);
      resolve();
    }, 0);
  });
});

test('BEFORE hook gets executed on every func invocation', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('before', () => values.push(0));
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);

  t.is(values.length, 4);
});

test('ONCEBEFORE hook gets executed only one time', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('oncebefore', () => values.push(0));
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);

  t.is(values.length, 1);
});

test('AFTER hook gets executed on every func inocation', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('after', () => values.push(0));
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values.length, 4);
      resolve();
    }, 0);
  });
});

test('ONCEAFTER hook gets executed only one time', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];
  onSum('onceafter', () => values.push(0));
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);
  sum(1, 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      t.is(values.length, 1);
      resolve();
    }, 0);
  });
});

test('OFF should clear hooks', (t) => {
  const [sum, onSum, offSum] = hamo((a, b) => a + b);

  const values = [];

  onSum('before', () => values.push(0));
  onSum('oncebefore', () => values.push(0));
  onSum('after', () => values.push(0));
  onSum('onceafter', () => values.push(0));

  offSum('before');
  offSum('oncebefore');
  offSum('after');
  offSum('onceafter');

  sum(1, 2);

  t.is(values.length, 0);
});

test('BEFORE and ONCEBEFORE should feed hook with arguments', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];

  onSum('before', (a, b) => values.push([a, b]));
  onSum('oncebefore', (a, b) => values.push([a, b]));

  sum(1, 2);

  t.deepEqual(values[0], [1, 2]);
  t.deepEqual(values[1], [1, 2]);
});

test('AFTER and ONCEAFTER should feed hook with result AND arguments', (t) => {
  const [sum, onSum] = hamo((a, b) => a + b);

  const values = [];

  onSum('after', (value, a, b) => values.push([value, a, b]));
  onSum('onceafter', (value, a, b) => values.push([value, a, b]));

  sum(1, 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      t.deepEqual(values[0], [3, 1, 2]);
      t.deepEqual(values[1], [3, 1, 2]);
      resolve();
    }, 0);
  });
});
