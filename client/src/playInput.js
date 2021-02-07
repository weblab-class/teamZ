import { playKeyDown, playKeyUp } from "./client-socket";

const keyTranslator = {
  w: "w",
  W: "w",
  a: "a",
  A: "a",
  s: "s",
  S: "s",
  d: "d",
  D: "d",
  ArrowLeft: "a",
  ArrowRight: "d",
  ArrowUp: "w",
  ArrowDown: "s",
};
const handleKeyDown = (e) => {
  if (e.key in keyTranslator) {
    playKeyDown(keyTranslator[e.key]);
  }
};
const handleKeyUp = (e) => {
  if (e.key in keyTranslator) {
    playKeyUp(keyTranslator[e.key]);
  }
};

/**
 * Initializes input for the play page
 * @return a callback () => void to remove the inputs that were initialized by
 * the invocation of this function.
 */
export const initInput = () => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
