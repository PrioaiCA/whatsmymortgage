import { defaultState, compute } from '../lib/calc-math/renew.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('renew', () => ({ ...defaultState }), compute);
