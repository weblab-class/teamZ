// // import instructions from client-socket
import { keyDown, keyUp } from "./client-socket";

/** add other controls here */
// const handleInput = (e) => {
//   if (e.key === "ArrowUp") {
//     move("up");
//   } else if (e.key === "ArrowDown") {
//     move("down");
//   } else if (e.key === "ArrowLeft") {
//     move("left");
//   } else if (e.key === "ArrowRight") {
//     move("right");
//   }
// };

const keyTranslator = {
  w: "w",
  a: "a",
  s: "s",
  d: "d",
};
const handleKeyDown = (e) => {
  console.log("handleKeyDown in editInput called with key: " + e.key);
  if (e.key in keyTranslator) {
    keyDown(keyTranslator[e.key]);
  }
};
const handleKeyUp = (e) => {
  if (e.key in keyTranslator) {
    keyUp(keyTranslator[e.key]);
  }
};

/**
 * adds a *window* listener for any keydowns.
 *
 * THIS IS GLOBAL
 *
 * That this means *any time* you press an arrow key you'll move if you're on the site
 * */
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
