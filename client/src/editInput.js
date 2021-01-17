import { keyDown, keyUp, mouseMove, mouseDown, mouseUp } from "./client-socket";

const keyTranslator = {
  w: "w",
  W: "w",
  a: "a",
  A: "a",
  s: "s",
  S: "s",
  d: "d",
  D: "d",
  Shift: "SHIFT",
  " ": "SHIFT",
};
const handleKeyDown = (e) => {
  if (e.key in keyTranslator) {
    keyDown(keyTranslator[e.key]);
  }
};
const handleKeyUp = (e) => {
  if (e.key in keyTranslator) {
    keyUp(keyTranslator[e.key]);
  }
};

const getMousePosition = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};
const handleMouseMove = (e, canvas) => {
  mouseMove(getMousePosition(e, canvas));
};

const handleMouseDown = (e) => {
  mouseDown();
};

const handleMouseUp = (e) => {
  mouseUp();
};

/**
 * adds a *window* listener for any keydowns.
 *
 * THIS IS GLOBAL
 *
 * That this means *any time* you press an arrow key you'll move if you're on the site
 * */

export const initInput = (information) => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("mousemove", (e) => handleMouseMove(e, information.canvas));
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
};
