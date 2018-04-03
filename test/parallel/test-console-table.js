'use strict';

const common = require('../common');

const assert = require('assert');
const { Console } = require('console');

const queue = [];

const console = new Console({ write: (x) => {
  queue.push(x);
}, removeListener: () => {} }, process.stderr, false);

function test(data, only, expected) {
  if (arguments.length === 2) {
    expected = only;
    only = undefined;
  }
  console.table(data, only);
  assert.strictEqual(queue.shift(), expected.trimLeft());
}

common.expectsError(() => console.table([], false), {
  code: 'ERR_INVALID_ARG_TYPE',
});

test(null, 'null\n');
test(undefined, 'undefined\n');
test(false, 'false\n');
test('hi', 'hi\n');
test(Symbol(), 'Symbol()\n');

test([1, 2, 3], `
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │   1    │
│    1    │   2    │
│    2    │   3    │
└─────────┴────────┘
`);

test([Symbol(), 5, [10]], `
┌─────────┬──────────┐
│ (index) │  Values  │
├─────────┼──────────┤
│    0    │ Symbol() │
│    1    │    5     │
│    2    │  [ 10 ]  │
└─────────┴──────────┘
`);

test([undefined, 5], `
┌─────────┬───────────┐
│ (index) │  Values   │
├─────────┼───────────┤
│    0    │ undefined │
│    1    │     5     │
└─────────┴───────────┘
`);

test({ a: 1, b: Symbol(), c: [10] }, `
┌─────────┬────┬──────────┐
│ (index) │ 0  │  Values  │
├─────────┼────┼──────────┤
│    a    │    │    1     │
│    b    │    │ Symbol() │
│    c    │ 10 │          │
└─────────┴────┴──────────┘
`);

test(new Map([ ['a', 1], [Symbol(), [2]] ]), `
┌───────────────────┬──────────┬────────┐
│ (iteration index) │   Key    │ Values │
├───────────────────┼──────────┼────────┤
│         0         │   'a'    │   1    │
│         1         │ Symbol() │ [ 2 ]  │
└───────────────────┴──────────┴────────┘
`);

test(new Set([1, 2, Symbol()]), `
┌───────────────────┬──────────┐
│ (iteration index) │  Values  │
├───────────────────┼──────────┤
│         0         │    1     │
│         1         │    2     │
│         2         │ Symbol() │
└───────────────────┴──────────┘
`);

test({ a: 1, b: 2 }, ['a'], `
┌─────────┬───┐
│ (index) │ a │
├─────────┼───┤
│    a    │   │
│    b    │   │
└─────────┴───┘
`);

test([{ a: 1, b: 2 }, { a: 3, c: 4 }], ['a'], `
┌─────────┬───┐
│ (index) │ a │
├─────────┼───┤
│    0    │ 1 │
│    1    │ 3 │
└─────────┴───┘
`);

// BUGBUG: https://github.com/nodejs/node-chakracore/issues/510 -  need to
//         re-enable for Chakra when previewMapIterator is implemented
if (!common.isChakraEngine) {
test(new Map([[1, 1], [2, 2], [3, 3]]).entries(), `
┌───────────────────┬─────┬────────┐
│ (iteration index) │ Key │ Values │
├───────────────────┼─────┼────────┤
│         0         │  1  │   1    │
│         1         │  2  │   2    │
│         2         │  3  │   3    │
└───────────────────┴─────┴────────┘
`);
}

// BUGBUG: https://github.com/nodejs/node-chakracore/issues/510 - need to 
//         re-enable for Chakra when previewMapIterator is implemented
if (!common.isChakraEngine) {
test(new Set([1, 2, 3]).values(), `
┌───────────────────┬────────┐
│ (iteration index) │ Values │
├───────────────────┼────────┤
│         0         │   1    │
│         1         │   2    │
│         2         │   3    │
└───────────────────┴────────┘
`);
}

test({ a: { a: 1, b: 2, c: 3 } }, `
┌─────────┬───┬───┬───┐
│ (index) │ a │ b │ c │
├─────────┼───┼───┼───┤
│    a    │ 1 │ 2 │ 3 │
└─────────┴───┴───┴───┘
`);

test({ a: [1, 2] }, `
┌─────────┬───┬───┐
│ (index) │ 0 │ 1 │
├─────────┼───┼───┤
│    a    │ 1 │ 2 │
└─────────┴───┴───┘
`);

test({ a: [1, 2, 3, 4, 5], b: 5, c: { e: 5 } }, `
┌─────────┬───┬───┬───┬───┬───┬───┬────────┐
│ (index) │ 0 │ 1 │ 2 │ 3 │ 4 │ e │ Values │
├─────────┼───┼───┼───┼───┼───┼───┼────────┤
│    a    │ 1 │ 2 │ 3 │ 4 │ 5 │   │        │
│    b    │   │   │   │   │   │   │   5    │
│    c    │   │   │   │   │   │ 5 │        │
└─────────┴───┴───┴───┴───┴───┴───┴────────┘
`);

test(new Uint8Array([1, 2, 3]), `
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │   1    │
│    1    │   2    │
│    2    │   3    │
└─────────┴────────┘
`);

test(Buffer.from([1, 2, 3]), `
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │   1    │
│    1    │   2    │
│    2    │   3    │
└─────────┴────────┘
`);

test({ a: undefined }, ['x'], `
┌─────────┬───┐
│ (index) │ x │
├─────────┼───┤
│    a    │   │
└─────────┴───┘
`);

test([], `
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
└─────────┴────────┘
`);

test(new Map(), `
┌───────────────────┬─────┬────────┐
│ (iteration index) │ Key │ Values │
├───────────────────┼─────┼────────┤
└───────────────────┴─────┴────────┘
`);
