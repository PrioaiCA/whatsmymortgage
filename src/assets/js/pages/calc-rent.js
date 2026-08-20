import { defaultState, compute } from '../lib/calc-math/rent.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('rent', () => ({ ...defaultState }), compute);
