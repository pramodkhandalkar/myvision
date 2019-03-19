import fabric from 'fabric';
import polygonProperties from './polygonProperties';
import generatePolygonAfterMove from './movedPolygonUtils/generatePolygonAfterMove';

let canvas = null;
let polygon = null;
let polygonPoints = [];
let editingPolygon = false;

function getPolygonEditingStatus() {
  return editingPolygon;
}

function sendPolygonPointsToFront() {
  canvas.discardActiveObject();
  polygonPoints.forEach((point) => {
    if (point) {
      point.bringForward();
    }
  });
  editingPolygon = true;
}

function displayPolygonPoints() {
  let pointId = 0;
  polygon.get('points').forEach((point) => {
    const pointObj = new fabric.Circle(polygonProperties.existingPolygonPoint(pointId, point));
    canvas.add(pointObj);
    polygonPoints.push(pointObj);
    pointId += 1;
  });
}

function displayRemovablePolygonPoints() {
  let pointId = 0;
  polygon.get('points').forEach((point) => {
    const pointObj = new fabric.Circle(polygonProperties.removablePolygonPoint(pointId, point));
    canvas.add(pointObj);
    polygonPoints.push(pointObj);
    pointId += 1;
  });
}

function displayPolygonPointsAfterMove() {
  polygon = generatePolygonAfterMove(polygon, polygonPoints, canvas, polygonProperties);
  editingPolygon = true;
}

function setSelectedObjects(activeCanvasObj, activePolygonObject) {
  canvas = activeCanvasObj;
  polygon = activePolygonObject;
}

function setEditablePolygon(canvasObj, polygonObj, removablePoints) {
  setSelectedObjects(canvasObj, polygonObj);
  canvasObj.discardActiveObject();
  if (!removablePoints) {
    displayPolygonPoints();
  } else {
    displayRemovablePolygonPoints();
  }
  editingPolygon = true;
}

function setEditablePolygonAfterMoving(canvasObj, polygonObj) {
  setSelectedObjects(canvasObj, polygonObj);
  canvasObj.discardActiveObject();
  displayPolygonPointsAfterMove();
}

function removePolygonPoints() {
  if (polygonPoints.length !== 0) {
    polygonPoints.forEach((point) => {
      canvas.remove(point);
    });
    canvas.renderAll();
    polygonPoints = [];
  }
  editingPolygon = false;
}

function resetPolygonSelectableArea() {
  const newPosition = polygon._calcDimensions();
  polygon.set({
    left: newPosition.left,
    top: newPosition.top,
    height: newPosition.height,
    width: newPosition.width,
    pathOffset: {
      x: newPosition.left + newPosition.width / 2,
      y: newPosition.top + newPosition.height / 2,
    },
  });
  polygon.setCoords();
  canvas.renderAll();
}

function movePolygonPoint(event) {
  const { left } = event.target;
  const { top } = event.target;
  const polygonPoint = event.target;
  polygon.points[polygonPoint.pointId] = {
    x: left, y: top,
  };
}

function removePolygon() {
  if (polygon) {
    canvas.remove(polygon);
  }
}

function removePolygonPoint(pointId) {
  if (polygon.points.length - polygon.numberOfNullPolygonPoints > 3) {
    // bug somewhere here
    if (Object.keys(polygon.points[pointId]).length === 0) {
      polygon.points[polygon.points.length - 1] = polygon.points[pointId - 1];
      polygon.points[pointId - 1] = {};
    } else if ((polygon.points.length - 1) === pointId) {
      for (let i = pointId - 1; i > -1; i -= 1) {
        if (Object.keys(polygon.points[i]).length !== 0) {
          polygon.points[pointId] = polygon.points[i];
          polygon.points[i] = {};
          break;
        }
      }
    } else {
      polygon.points[pointId] = {};
    }
    canvas.remove(polygonPoints[pointId]);
    polygonPoints[pointId] = null;
    polygon.numberOfNullPolygonPoints += 1;
    if (polygon.points.length - polygon.numberOfNullPolygonPoints > 3) {
      // make sure removable points when editing
      // make invisible circle width a little bit bigger
      console.log('need to signal restrictions');
    }
    canvas.renderAll();
  }
}

export {
  setEditablePolygon, resetPolygonSelectableArea,
  movePolygonPoint, sendPolygonPointsToFront,
  removePolygonPoints, displayPolygonPointsAfterMove,
  setEditablePolygonAfterMoving, removePolygon,
  removePolygonPoint, getPolygonEditingStatus,
  displayRemovablePolygonPoints,
};
