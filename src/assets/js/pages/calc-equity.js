import { defaultState, compute } from '../lib/calc-math/equity.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('equity', () => ({ ...defaultState }), compute);
