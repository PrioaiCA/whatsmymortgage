// Convenience aggregator — used at build time (11ty data/shortcodes) where
// pulling in all five is fine. Client pages import the single calc-math/*
// file they need directly, never this file, so no page downloads five
// calculators to run one.
import * as afford from './afford.js';
import * as renew from './renew.js';
import * as equity from './equity.js';
import * as penalty from './penalty.js';
import * as rent from './rent.js';
import * as payment from './payment.js';
import * as ltt from './ltt.js';
import * as cmhc from './cmhc.js';
import * as stress from './stress.js';
import * as gdstds from './gdstds.js';
import * as amortization from './amortization.js';

export const calcModules = { afford, renew, equity, penalty, rent, payment, ltt, cmhc, stress, gdstds, amortization };

export const computers = {
  afford: afford.compute,
  renew: renew.compute,
  equity: equity.compute,
  penalty: penalty.compute,
  rent: rent.compute,
  payment: payment.compute,
  ltt: ltt.compute,
  cmhc: cmhc.compute,
  stress: stress.compute,
  gdstds: gdstds.compute,
  amortization: amortization.compute
};

export const defaultStates = {
  afford: afford.defaultState,
  renew: renew.defaultState,
  equity: equity.defaultState,
  penalty: penalty.defaultState,
  rent: rent.defaultState,
  payment: payment.defaultState,
  ltt: ltt.defaultState,
  cmhc: cmhc.defaultState,
  stress: stress.defaultState,
  gdstds: gdstds.defaultState,
  amortization: amortization.defaultState
};
