import { defaultState, compute } from '../lib/calc-math/penalty.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('penalty', () => ({ ...defaultState }), compute);
