// Tiny shared module letting calc-controller.js publish "what calculator,
// what inputs, what result is currently on screen" so contact-controller.js
// can attach it to a lead without the two needing to know about each other.
let ctx = null;

export function setLeadContext(next) {
  ctx = next;
}

export function getLeadContext() {
  return ctx;
}
