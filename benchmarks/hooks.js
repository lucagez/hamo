const { Suite } = require('benchmark');
const hamo = require('../src/hamo');

const suite = new Suite();

const [befored, onBefored] = hamo((a, b) => a + b);
const [oncebefored, onOncebefored] = hamo((a, b) => a + b);
const [aftered, onAftered] = hamo((a, b) => a + b);
const [onceaftered, onOnceaftered] = hamo((a, b) => a + b);

onBefored('before', () => 'before');
onOncebefored('oncebefore', () => 'oncebefore');
onAftered('after', () => 'after');
onOnceaftered('onceafter', () => 'onceafter');

suite
  .add('before hook', () => {
    befored(1, 2);
  })
  .add('after hook', () => {
    aftered(1, 2);
  })
  .add('oncebefore hook', () => {
    oncebefored(1, 2);
  })
  .add('onceafter hook', () => {
    onceaftered(1, 2);
  })
  .on('cycle', event => console.log(String(event.target)))
  .run();
