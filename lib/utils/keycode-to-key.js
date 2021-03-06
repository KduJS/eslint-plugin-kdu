// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
/** @type { { [key: number]: string }  } */
module.exports = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  19: 'pause', // windows
  20: 'caps-lock',
  27: 'escape',
  32: 'space', // Kdu.js specially key name.
  33: 'page-up',
  34: 'page-down',
  35: 'end',
  36: 'home',
  37: 'arrow-left',
  38: 'arrow-up',
  39: 'arrow-right',
  40: 'arrow-down',
  45: 'insert', // windows
  46: 'delete',

  // If mistakenly use it in Kdu.js 2.x, it will be irreversibly broken. Therefore, it will not be autofix.
  // '48': '0',
  // '49': '1',
  // '50': '2',
  // '51': '3',
  // '52': '4',
  // '53': '5',
  // '54': '6',
  // '55': '7',
  // '56': '8',
  // '57': '9',

  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',

  // The key value may change depending on the OS.
  // '91': 'meta' ,// Win: 'os'?
  // '92': 'meta', // Win: 'meta' Mac: ?
  // '93': 'meta',  // Win: 'context-menu' Mac: 'meta'

  // Cannot determine numpad with key.
  // '96': 'numpad-0',
  // '97': 'numpad-1',
  // '98': 'numpad-2',
  // '99': 'numpad-3',
  // '100': 'numpad-4',
  // '101': 'numpad-5',
  // '102': 'numpad-6',
  // '103': 'numpad-7',
  // '104': 'numpad-8',
  // '105': 'numpad-9',
  // '106': 'multiply',
  // '107': 'add',
  // '109': 'subtract',
  // '110': 'decimal',
  // '111': 'divide',
  112: 'f1',
  113: 'f2',
  114: 'f3',
  115: 'f4',
  116: 'f5',
  117: 'f6',
  118: 'f7',
  119: 'f8',
  120: 'f9',
  121: 'f10',
  122: 'f11',
  123: 'f12',
  144: 'num-lock',
  145: 'scroll-lock'
}
