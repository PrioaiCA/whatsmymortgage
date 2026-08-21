import { defaultState, compute } from '../lib/calc-math/gdstds.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('gdstds', () => ({ ...defaultState }), compute);
