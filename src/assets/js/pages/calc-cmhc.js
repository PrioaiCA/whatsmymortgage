import { defaultState, compute } from '../lib/calc-math/cmhc.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('cmhc', () => ({ ...defaultState }), compute);
