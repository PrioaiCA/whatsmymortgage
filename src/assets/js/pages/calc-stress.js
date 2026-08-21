import { defaultState, compute } from '../lib/calc-math/stress.js';
import { initCalcPage } from '../calc-controller.js';
initCalcPage('stress', () => ({ ...defaultState }), compute);
