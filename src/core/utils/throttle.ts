/* eslint-disable @typescript-eslint/ban-types */
export default function throttle (func: Function, threshold: number) {
  if (!threshold || threshold < 0) threshold = 250;
  let last: number;
  let deferred: number|undefined;
  return function (...args: unknown[]) {
    const now = +new Date();
    if (last && now < last + threshold) {
      clearTimeout(deferred);
      deferred = window.setTimeout(function () {
        last = now;
        func(...args);
      }, threshold);
    } else {
      last = now;
      func(...args);
    }
  };
}
