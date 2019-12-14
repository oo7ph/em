/** Defines global keyboard shortcuts and gestures. */

import { isMac } from './browser.js'
import { store } from './store.js'

import bindContext from './shortcuts/bindContext.js'
import cursorBack from './shortcuts/cursorBack.js'
import cursorDown from './shortcuts/cursorDown.js'
import cursorForward from './shortcuts/cursorForward.js'
import cursorNextThought from './shortcuts/cursorNextThought.js'
import cursorPrev from './shortcuts/cursorPrev.js'
import cursorUp from './shortcuts/cursorUp.js'
import deleteEmptyThought from './shortcuts/deleteEmptyThought.js'
import deleteThought, { deleteAliases } from './shortcuts/delete.js'
import home from './shortcuts/home.js'
import indent from './shortcuts/indent.js'
import newSubthought, { newSubthoughtAliases } from './shortcuts/newSubthought.js'
import newSubthoughtTop from './shortcuts/newSubthoughtTop.js'
import newThought, { newThoughtAliases } from './shortcuts/newThought.js'
import newThoughtAbove from './shortcuts/newThoughtAbove.js'
import newUncle from './shortcuts/newUncle.js'
import openShortcutPopup from './shortcuts/openShortcutPopup.js'
import outdent from './shortcuts/outdent.js'
import search from './shortcuts/search.js'
import subcategorizeAll from './shortcuts/subcategorizeAll.js'
import subcategorizeOne from './shortcuts/subcategorizeOne.js'
import toggleCodeView from './shortcuts/toggleCodeView.js'
import toggleContextView from './shortcuts/toggleContextView.js'

// weird that we have to inline perma since all of the util functions are initially undefined when globalShortcuts gets initiated
/** Returns a function that calls the given function once then returns the same result forever */
function perma(f) {
  let result = null // eslint-disable-line fp/no-let
  return (...args) => result || (result = f(...args))
}

/* Map global keyboard shortcuts and gestures to commands */
// define globalShortcuts as a function to avoid import timing issues
export const globalShortcuts = perma(() => [ // eslint-disable-line fp/no-mutating-methods
  bindContext,
  cursorBack,
  cursorDown,
  cursorForward,
  cursorNextThought,
  cursorPrev,
  cursorUp,
  deleteAliases,
  deleteEmptyThought,
  deleteThought,
  home,
  indent,
  newSubthought,
  newSubthoughtAliases,
  newSubthoughtTop,
  newThought,
  newThoughtAbove,
  newThoughtAliases,
  newUncle,
  openShortcutPopup,
  outdent,
  search,
  subcategorizeAll,
  subcategorizeOne,
  toggleCodeView,
  toggleContextView,
]

// ensure modified shortcuts are checked before unmodified
// sort the original list to avoid performance hit in handleKeyboard
.sort((a, b) =>
  a.keyboard &&
  b.keyboard &&
  ((a.keyboard.meta && !b.keyboard.meta) ||
   (a.keyboard.alt && !b.keyboard.alt) ||
   (a.keyboard.shift && !b.keyboard.shift)) ? -1 : 1
))

export const handleGesture = (gesture, e) => {

  // disable when modal is displayed or a drag is in progress
  const state = store.getState()
  if (state.showModal || state.dragInProgress) return

  const shortcut = globalShortcuts().find(shortcut => [].concat(shortcut.gesture).includes(gesture))
  if (shortcut) {
    shortcut.exec(e, { type: 'gesture' })
  }
}

export const handleKeyboard = e => {

  // disable when welcome, shortcuts, or feeback modals are displayed
  const state = store.getState()
  if (state.showModal === 'welcome' || state.showModal === 'shortcuts' || state.showModal === 'feedback') return

  const shortcut = globalShortcuts().find(shortcut =>
    shortcut.keyboard &&
    (shortcut.keyboard.key || shortcut.keyboard) === e.key &&
    // either the modifier is pressed, or it is not necessary
    (!shortcut.keyboard.meta || (e.metaKey || e.ctrlKey)) &&
    (!shortcut.keyboard.alt || e.altKey) &&
    (!shortcut.keyboard.shift || e.shiftKey)
  )

  // execute the shortcut if it exists
  // preventDefault by default, unless e.allowDefault() is called
  let isAllowDefault = false // eslint-disable-line fp/no-let
  e.allowDefault = () => isAllowDefault = true // eslint-disable-line no-return-assign
  if (shortcut) {
    shortcut.exec(e, { type: 'keyboard' })
    if (!isAllowDefault) {
      e.preventDefault()
    }
  }
}

/** Converts a gesture letter or event key of an arrow key to an arrow utf8 character. Defaults to input. */
const arrowTextToArrowCharacter = str => ({
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓'
}[str] || str)

export const formatKeyboardShortcut = keyboard => {
  const key = keyboard.key || keyboard
  return (keyboard.meta ? (isMac ? 'Command' : 'Ctrl') + ' + ' : '') +
    (keyboard.control ? 'Control + ' : '') +
    (keyboard.option ? 'Option + ' : '') +
    (keyboard.shift ? 'Shift + ' : '') +
    arrowTextToArrowCharacter(keyboard.shift && key.length === 1 ? key.toUpperCase() : key)
}

export const shortcutById = id => globalShortcuts().find(shortcut => shortcut.id === id)
