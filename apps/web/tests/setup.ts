import '@testing-library/jest-dom';

// jsdom does not implement HTMLDialogElement.showModal/close, but the Modal
// component relies on the native <dialog> API. Stub them on the prototype so
// dialogs render and can be exercised in tests.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open');
};
