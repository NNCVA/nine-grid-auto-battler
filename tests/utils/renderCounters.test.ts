import { beforeEach, describe, expect, it } from 'vitest';
import {
  enableRenderCounters,
  getRenderCountsSnapshot,
  recordRender,
  resetRenderCounters,
} from '../../utils/performance/renderCounters';

describe('renderCounters', () => {
  beforeEach(() => {
    resetRenderCounters();
  });

  it('tracks named render events when counters are enabled', () => {
    enableRenderCounters(true);

    recordRender('GameScreen');
    recordRender('GameScreen');
    recordRender('BattleUnit');

    expect(getRenderCountsSnapshot()).toEqual({
      BattleUnit: 1,
      GameScreen: 2,
    });
  });

  it('resets tracked counts back to an empty snapshot', () => {
    enableRenderCounters(true);
    recordRender('GameGrid');

    resetRenderCounters();

    expect(getRenderCountsSnapshot()).toEqual({});
  });
});
