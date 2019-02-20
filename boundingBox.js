import fabric from 'fabric';
import { removeBndBoxIfLabelNamePending, showLabelNamePopUp } from './labelNamePopUp';

let canvas = null;
let createNewBoundingBoxBtnClicked = false;
let leftMouseBtnDown = false;
const bndBoxProps = {};

function instantiateNewBndBox() {
  if (createNewBoundingBoxBtnClicked) {
    leftMouseBtnDown = true;
    const pointer = canvas.getPointer(canvas.e);
    bndBoxProps.origX = pointer.x;
    bndBoxProps.origY = pointer.y;
    bndBoxProps.rect = new fabric.Rect({
      left: bndBoxProps.origX,
      top: bndBoxProps.origY,
      width: pointer.x - bndBoxProps.origX,
      height: pointer.y - bndBoxProps.origY,
      stroke: 'rgba(255,0,0)',
      strokeWidth: 2,
      fill: 'rgba(255,0,0,0)',
    });
    canvas.add(bndBoxProps.rect);
  }
}

function createNewBndBoxBtnClick() {
  removeBndBoxIfLabelNamePending();
  createNewBoundingBoxBtnClicked = true;
  canvas.discardActiveObject();
  canvas.renderAll();
  canvas.forEachObject((iteratedObj) => {
    iteratedObj.selectable = false;
  });
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
}

function drawBndBox(obj) {
  if (!leftMouseBtnDown) return;
  const pointer = canvas.getPointer(obj.e);
  if (bndBoxProps.origX > pointer.x) {
    bndBoxProps.rect.set({ left: Math.abs(pointer.x) });
  }
  if (bndBoxProps.origY > pointer.y) {
    bndBoxProps.rect.set({ top: Math.abs(pointer.y) });
  }
  bndBoxProps.rect.set({ width: Math.abs(bndBoxProps.origX - pointer.x) });
  bndBoxProps.rect.set({ height: Math.abs(bndBoxProps.origY - pointer.y) });
  canvas.renderAll();
}

function finishDrawingBndBox(obj) {
  if (leftMouseBtnDown) {
    createNewBoundingBoxBtnClicked = false;
    leftMouseBtnDown = false;
    bndBoxProps.rect.setCoords();
    bndBoxProps.rect.selectable = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    canvas.forEachObject((iteratedObj) => {
      iteratedObj.selectable = true;
    });
    const pointer = canvas.getPointer(obj.e);
    showLabelNamePopUp(pointer.x, pointer.y, bndBoxProps.rect, canvas);
  }
}

function highlightBndBox(obj) {
  if (obj.target && obj.target._objects) {
    obj.target._objects[0].set('fill', 'rgba(255,0,0,0.2)');
    canvas.renderAll();
  }
}

function removeBndBoxHighlight(obj) {
  if (obj.target && obj.target._objects) {
    obj.target._objects[0].set('fill', 'rgba(255,0,0,0');
    canvas.renderAll();
  }
}

function removeBndBoxBtnClick() {
  removeBndBoxIfLabelNamePending();
  canvas.remove(canvas.getActiveObject());
}

function setBndBoxCanvas(newCanvas) {
  canvas = newCanvas;
}

export {
  setBndBoxCanvas,
  createNewBndBoxBtnClick,
  instantiateNewBndBox,
  drawBndBox,
  finishDrawingBndBox,
  highlightBndBox,
  removeBndBoxHighlight,
  removeBndBoxBtnClick,
};
