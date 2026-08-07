/**
 * core/debounce.js
 * Delays invoking `fn` until `delay` ms have passed since the last
 * call. Used on the portfolio search input so filtering doesn't run
 * on every keystroke.
 */
export function debounce(fn, delay = 200) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
