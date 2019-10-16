// noinspection DuplicatedCode
export default function throttle (func, threshold, context) {
  if (!threshold || threshold < 0) threshold = 250;
  let last;
  let deferred;
  return function () {
    const self = context || this;
    const now = +new Date();
    const args = arguments;
    if (last && now < last + threshold) {
      clearTimeout(deferred);
      deferred = setTimeout(function () {
        last = now;
        func.apply(self, args);
      }, threshold);
    } else {
      last = now;
      func.apply(self, args);
    }
  };
};
