import { defaultState, compute } from '../lib/calc-math/afford.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('afford', () => ({ ...defaultState }), compute);
