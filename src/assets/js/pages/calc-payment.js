import { defaultState, compute } from '../lib/calc-math/payment.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('payment', () => ({ ...defaultState }), compute);
