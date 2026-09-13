import { isCompleteStageOrder } from '../src/utils/workflow-order.utils';

describe('isCompleteStageOrder', () => {
  it('accepts every stage exactly once, including a parallel group', () => {
    expect(isCompleteStageOrder(['a', 'b', 'c'], [['a'], ['b', 'c']])).toBe(
      true
    );
  });

  it('rejects missing or duplicate stages', () => {
    expect(isCompleteStageOrder(['a', 'b'], [['a']])).toBe(false);
    expect(isCompleteStageOrder(['a', 'b'], [['a', 'a']])).toBe(false);
  });
});
