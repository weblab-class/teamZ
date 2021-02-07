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
  e: "e",
  E: "e",
  ArrowLeft: "a",
  ArrowRight: "d",
  ArrowUp: "w",
  ArrowDown: "s",
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
    x: Math.floor(((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
    y: Math.floor(((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height),
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
 * Initializes input for the edit page
 * @param {*} information {canvas: the canvas element on the edit page}
 * @return a callback () => void to remove the inputs that were initialized by
 * the invocation of this function.
 */
export const initInput = (information) => {
  const mouseMoveFn = (e) => {
    handleMouseMove(e, information.canvas);
  };
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("mousemove", mouseMoveFn);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("mousemove", mouseMoveFn);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
  };
};
