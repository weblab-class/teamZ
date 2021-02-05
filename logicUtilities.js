const constants = require("./constants.js");

/**
 * Translates abstract coordinates to canvas coordinates
 * @param {*} absX abstract x cor
 * @param {*} absY abstract y cor
 * @param {*} camX x cor of camera
 * @param {*} camY y cor of camera
 * @return a dictionary with attributes `x` and `y` containing the desired canvas coordinates.
 */
export const toCanvasCors = (absX, absY, camX, camY) => {
  const retX = (absX - camX) * constants.canvasToAbstractRatio;
  const retY = (absY - camY) * constants.canvasToAbstractRatio;
  return { x: retX, y: retY };
};

/**
 * Translates canvas coordinates to abstract coordinates
 * @param {*} canX canvas x cor
 * @param {*} canY canvas y cor
 * @param {*} camX x cor of camera
 * @param {*} camY y cor of camera
 * @return a dictionary with attributes `x` and `y` containing the desired abstract coordinates.
 */
export const toAbstractCors = (canX, canY, camX, camY) => {
  return {
    x: Math.floor(canX / constants.canvasToAbstractRatio + camX),
    y: Math.floor(canY / constants.canvasToAbstractRatio + camY),
  };
};
