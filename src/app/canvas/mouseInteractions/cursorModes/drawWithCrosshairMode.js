import fabric from 'fabric';
import crosshairProps from '../../objects/crosshair/properties';
import { getIsMouseOnCanvasStatus, executeFunctionOnceOnMouseOver, executeFunctionOnMouseOut } from '../../../keyEvents/mouse/mouseOverOut';
import { getLastMouseMoveEvent } from '../../../keyEvents/mouse/mouseMove';
import { getCurrentZoomState } from '../../../tools/state';
import IS_FIREFOX from '../../../tools/utils/browserType';

let canvasRef = null;
let canvasCrosshairLineX = null;
let canvasCrosshairLineY = null;
let outsideCrosshairLineXElement = null;
let outsideCrosshairLineYElement = null;
let canvasAbsolutelContainer1Element = null;
let canvasAbsolutelContainer2Element = null;
let moveCanvasCrosshairFunc = null;

const HORIZONTAL_DELTA = 0.3;
let VERTICAL_DELTA = 0.7;

function setCanvasCrosshairCoordinates() {
  canvasCrosshairLineX.setCoords();
  canvasCrosshairLineY.setCoords();
}

function moveCanvasCrosshairDefault(event, canvas) {
  if (!event.pointer.x) return;
  canvasCrosshairLineX.set({
    x1: event.pointer.x + VERTICAL_DELTA,
    x2: event.pointer.x + VERTICAL_DELTA,
  });
  canvasCrosshairLineY.set({
    y1: event.pointer.y - HORIZONTAL_DELTA,
    y2: event.pointer.y - HORIZONTAL_DELTA,
  });
  canvas.renderAll();
}

function moveCanvasCrosshairOnZoom(event, canvas) {
  if (!event.pointer.x) return;
  const pointer = canvas.getPointer(event.e);
  canvasCrosshairLineX.set({
    x1: pointer.x + VERTICAL_DELTA,
    x2: pointer.x + VERTICAL_DELTA,
  });
  canvasCrosshairLineY.set({
    y1: pointer.y - HORIZONTAL_DELTA,
    y2: pointer.y - HORIZONTAL_DELTA,
  });
  setCanvasCrosshairCoordinates();
  canvas.renderAll();
}

function moveCanvasCrosshair(event, canvas) {
  moveCanvasCrosshairFunc(event, canvas);
}

function resetMoveCanvasCrosshairFunc() {
  moveCanvasCrosshairFunc = getCurrentZoomState() > 1.000001
    ? moveCanvasCrosshairOnZoom : moveCanvasCrosshairDefault;
}

function setCrosshairAfterZoom() {
  moveCanvasCrosshairFunc = moveCanvasCrosshairOnZoom;
  VERTICAL_DELTA = crosshairProps.verticalDelta();
}

function hideCanvasCrosshair(canvas) {
  if (!canvasCrosshairLineX || !canvasCrosshairLineY) return;
  canvasCrosshairLineX.set({ x1: -10, x2: -10 });
  canvasCrosshairLineY.set({ y1: -10, y2: -10 });
  canvas.renderAll();
}

function hideOutsideCrosshair() {
  if (!outsideCrosshairLineXElement || !outsideCrosshairLineYElement) return;
  outsideCrosshairLineXElement.style.top = '-10px';
  outsideCrosshairLineYElement.style.left = '-10px';
}

function hideCrosshair(canvas) {
  hideCanvasCrosshair(canvas || canvasRef);
  hideOutsideCrosshair();
}

function newCanvasCrosshairLine() {
  return new fabric.Line([0, 0, 0, 0], crosshairProps.crosshairProps());
}

function updateLinesWithNewCanvasDimensions(canvas) {
  canvasCrosshairLineX.set({ y2: canvas.height });
  canvasCrosshairLineY.set({ x2: canvas.width });
}

function addCanvasCrosshairLines(canvas) {
  canvasCrosshairLineX = newCanvasCrosshairLine();
  canvasCrosshairLineY = newCanvasCrosshairLine();
  canvasCrosshairLineX.set({ orientation: 'x' });
  canvasCrosshairLineY.set({ orientation: 'y' });
  updateLinesWithNewCanvasDimensions(canvas);
  canvas.add(canvasCrosshairLineX);
  canvas.add(canvasCrosshairLineY);
  hideCanvasCrosshair(canvas);
}

function mouseMoveEventHandler(event) {
  // the following check is used in the scenario where the mousemove event has been dispatched
  if (!event.pageY) {
    event = getLastMouseMoveEvent();
  }
  outsideCrosshairLineXElement.style.top = `${event.pageY - HORIZONTAL_DELTA}px`;
  outsideCrosshairLineYElement.style.left = `${event.pageX + VERTICAL_DELTA}px`;
}

function removeMouseMoveEventListener(element) {
  if (element) element.removeEventListener('mousemove', mouseMoveEventHandler);
}

function removeOutsideCrosshairEventListeners() {
  removeMouseMoveEventListener(canvasAbsolutelContainer1Element);
  removeMouseMoveEventListener(canvasAbsolutelContainer2Element);
}

function addMouseMoveEventHandlerToElement(element) {
  element.addEventListener('mousemove', mouseMoveEventHandler);
}

function addCrosshairOutsideOfCanvas() {
  addMouseMoveEventHandlerToElement(canvasAbsolutelContainer1Element);
  addMouseMoveEventHandlerToElement(canvasAbsolutelContainer2Element);
}

function removeCrosshairLinesIfExisting(canvas) {
  if (canvasCrosshairLineX) canvas.remove(canvasCrosshairLineX);
  if (canvasCrosshairLineY) canvas.remove(canvasCrosshairLineY);
  removeOutsideCrosshairEventListeners();
}

function removeCrosshair(canvas) {
  removeCrosshairLinesIfExisting(canvas);
  hideOutsideCrosshair();
  removeOutsideCrosshairEventListeners();
}

function setAllObjectsToUneditable(canvas) {
  canvas.forEachObject((iteratedObj) => {
    iteratedObj.selectable = false;
    iteratedObj.hoverCursor = 'none';
  });
}

function moveCanvasCrosshairViaLastCanvasPosition(canvas, func) {
  const lastMouseMoveEvent = getLastMouseMoveEvent();
  if (!lastMouseMoveEvent) return;
  const lastCanvasPointer = canvas.getPointer(lastMouseMoveEvent);
  const pointerEvent = { pointer: lastCanvasPointer };
  if (func) {
    func(pointerEvent, canvas);
  } else {
    moveCanvasCrosshair(pointerEvent, canvas);
  }
}

function moveCanvasCrosshairViaLastCanvasPositionAsync(canvas, func) {
  setTimeout(() => {
    if (!getIsMouseOnCanvasStatus()) return;
    moveCanvasCrosshairViaLastCanvasPosition(canvas || canvasRef, func);
  }, IS_FIREFOX ? 10 : 0);
}

function updatedLinesWithNewCanvasDimensionsAsync(canvas) {
  setTimeout(() => {
    updateLinesWithNewCanvasDimensions(canvas || canvasRef);
  }, IS_FIREFOX ? 10 : 0);
}

function moveCrosshair(canvas, func) {
  moveCanvasCrosshairViaLastCanvasPosition(canvas || canvasRef, func);
  if (!canvasAbsolutelContainer1Element) return;
  canvasAbsolutelContainer1Element.dispatchEvent(new Event('mousemove'));
  canvasAbsolutelContainer2Element.dispatchEvent(new Event('mousemove'));
}

function assignLocalVariables() {
  outsideCrosshairLineXElement = document.getElementById('crosshair-line-x');
  outsideCrosshairLineYElement = document.getElementById('crosshair-line-y');
  canvasAbsolutelContainer1Element = document.getElementById('canvas-absolute-container-1');
  canvasAbsolutelContainer2Element = document.getElementById('canvas-absolute-container-2');
}

function setDrawWithCrosshairMode(canvas, resetting) {
  canvasRef = canvas;
  assignLocalVariables();
  canvas.discardActiveObject();
  canvas.defaultCursor = 'none';
  canvas.hoverCursor = 'none';
  setAllObjectsToUneditable(canvas);
  resetMoveCanvasCrosshairFunc();
  // upon attempting to draw after labelling a shape, wait for the onmouseenter event
  // to be emitted by the canvas wrapper element
  if (resetting) {
    executeFunctionOnceOnMouseOver(moveCrosshair);
  } else {
    removeCrosshairLinesIfExisting(canvas);
    addCanvasCrosshairLines(canvas);
    addCrosshairOutsideOfCanvas();
    if (getIsMouseOnCanvasStatus()) moveCrosshair(canvas, moveCanvasCrosshairDefault);
    if (getCurrentZoomState() > 1.00001) setCanvasCrosshairCoordinates();
    executeFunctionOnMouseOut(hideCrosshair);
    canvas.renderAll();
  }
}

export {
  setCanvasCrosshairCoordinates,
  updatedLinesWithNewCanvasDimensionsAsync, resetMoveCanvasCrosshairFunc,
  moveCanvasCrosshairViaLastCanvasPositionAsync, moveCanvasCrosshairDefault,
  moveCanvasCrosshairOnZoom, moveCanvasCrosshair, removeCrosshairLinesIfExisting,
  setAllObjectsToUneditable, moveCrosshair, removeCrosshair, setCrosshairAfterZoom,
  setDrawWithCrosshairMode, removeOutsideCrosshairEventListeners, addCanvasCrosshairLines,
};