import { defaultState, compute } from '../lib/calc-math/amortization.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('amortization', () => ({ ...defaultState }), compute);
