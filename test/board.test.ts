'use strict';

import { assert } from 'chai';
import Board from '../source/lib/Board';

it('wins the game', () => {
  const board = new Board('o ox   x ');
  const after = board.makeMove('o');
  assert.equal(after, 'ooox   x ');
});

it('blocks opponent from winning', () => {
  const board = new Board('o  o  xx ');
  const after = board.makeMove('o');
  assert.equal(after, 'o  o  xxo');
});

it('creates a fork', () => {
  const board = new Board(' xo  x  o');
  const after = board.makeMove('o');
  assert(after === ' xo ox  o' || after === ' xo  xo o');
});

it('blocks opponent from forking', () => {
  let board = new Board('x   o   x');
  let after = board.makeMove('o');
  assert(
    after === 'xo  o   x' ||
      after === 'x  oo   x' ||
      after === 'x   oo  x' ||
      after === 'x   o  ox'
  );

  board = new Board('x     ox ');
  after = board.makeMove('o');
  assert.equal(after, 'x   o ox ');
});

it('marks the center', () => {
  const board = new Board('x        ');
  const after = board.makeMove('o');
  assert.equal(after, 'x   o    ');
});

it('marks a corner at the beginning', () => {
  const board = new Board('         ');
  const after = board.makeMove('o');
  assert(
    after === 'o        ' ||
      after === '  o      ' ||
      after === '      o  ' ||
      after === '        o'
  );
});

it('marks the opposite corner', () => {
  const board = new Board('  x o    ');
  const after = board.makeMove('o');
  assert.equal(after, '  x o o  ');
});

it('marks an empty corner', () => {
  const board = new Board('    x    ');
  const after = board.makeMove('o');
  assert(
    after === 'o   x    ' ||
      after === '  o x    ' ||
      after === '    x o  ' ||
      after === '    x   o'
  );
});
