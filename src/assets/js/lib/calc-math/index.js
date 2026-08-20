// Convenience aggregator — used at build time (11ty data/shortcodes) where
// pulling in all five is fine. Client pages import the single calc-math/*
// file they need directly, never this file, so no page downloads five
// calculators to run one.
import * as afford from './afford.js';
import * as renew from './renew.js';
import * as equity from './equity.js';
import * as penalty from './penalty.js';
import * as rent from './rent.js';

export const calcModules = { afford, renew, equity, penalty, rent };

export const computers = {
  afford: afford.compute,
  renew: renew.compute,
  equity: equity.compute,
  penalty: penalty.compute,
  rent: rent.compute
};

export const defaultStates = {
  afford: afford.defaultState,
  renew: renew.defaultState,
  equity: equity.defaultState,
  penalty: penalty.defaultState,
  rent: rent.defaultState
};
