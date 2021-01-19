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
 * adds a *window* listener for any keydowns.
 *
 * THIS IS GLOBAL
 *
 * That this means *any time* you press an arrow key you'll move if you're on the site
 * */

export const initInput = () => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
