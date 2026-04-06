/* Utility functions */ 
/**
 * Safely gets a DOM element with type casting
 * @param {string} id 
 * @returns { HTMLElement | null }
 */
export function getElement(id) {
    const el = document.getElementById(id);
    return (el instanceof HTMLElement) ? el : null;
};

/**
 * Safely gets an input element and returns it typed as HTMLInputElement
 * @param {string} id - Element ID to query
 * @returns {HTMLInputElement | null}
 */
export function getInputElement(id) {
    const el = document.getElementById(id);
    return (el instanceof HTMLInputElement) ? el : null;
};

/**
 * Safely gets a select element and returns it typed as HTMLSelectElement
 * @param {string} id - Element ID to query
 * @returns {HTMLSelectElement | null}
 */
export function getSelectElement(id) {
    const el = document.getElementById(id);
    return (el instanceof HTMLSelectElement) ? el : null;
};

/**
 * Safely gets a textarea element
 * @param {string} id - Element ID to query
 * @returns {HTMLTextAreaElement | null}
 */
export function getTextAreaElement(id) {
    const el = document.getElementById(id);
    return (el instanceof HTMLTextAreaElement) ? el : null;
};

/**
 * Shorthand function for querySelectorAll
 * @param {string} sel The CSS selector string
 * @param {Element|Document} [parent = document] The optional parent element to search within
 * @returns {NodeList} A static nodelist of all matching elements within the specified parent
 */
export function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
};

/**
 * Shorthand function for querySelector
 * @param {string} sel The CSS selector string
 * @param {Element|Document} [parent = document] The optional parent element to search within
 * @returns {NodeList} The first matching elements within the specified parent
 */
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
};

/**
 * Shorthand function for createElement
 * @param {string} Element The element to be created
 * @returns {HTMLElement}
 */
export function cEl(el) {
    return document.createElement(el);
};

/**
 * Sets multiple attributes from key-value pairs for a specified element
 * @param {Element|Function} el 
 * @param {Array(attribute: value)} attrs 
 */
function setAttributes(el, attrs) {
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  };
  return el;
};