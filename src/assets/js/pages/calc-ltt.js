import { defaultState, compute } from '../lib/calc-math/ltt.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('ltt', () => ({ ...defaultState }), compute);
