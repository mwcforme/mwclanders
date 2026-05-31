import "@testing-library/jest-dom";

// Stub browser APIs not implemented in jsdom
window.scrollTo = () => {};
Object.defineProperty(window, "scrollTo", { writable: true, value: () => {} });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Stub IntersectionObserver for components that use scroll reveals.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
// @ts-expect-error - test stub
window.IntersectionObserver = IO;
