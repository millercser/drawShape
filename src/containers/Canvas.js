import React, { useMemo, useRef, useState, useEffect } from "react";
import { Line, Stage, Layer, Image } from "react-konva";
import Button from "components/Button";
import PolygonAnnotation from "components/PolygonAnnotation";
import DraggableLine from "components/DraggableLine";
const videoSource = "./space_landscape.jpg"; // 图像文件路径

const wrapperStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  backgroundColor: "aliceblue",
};

const columnStyle = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 20,
  backgroundColor: "aliceblue",
};

const Canvas = () => {
  const [image, setImage] = useState();
  const imageRef = useRef(null);
  const dataRef = useRef(null);
  const [polygons, setPolygons] = useState([]); // 用于存储所有多边形
  const [currentPoints, setCurrentPoints] = useState([]); // 用于存储当前多边形顶点
  const [lines, setLines] = useState([]); // 用于存储所有直线
  const [currentLine, setCurrentLine] = useState([]); // 用于存储当前直线的顶点
  const [polylines, setPolylines] = useState([]); // 用于存储所有折线
  const [currentPolyline, setCurrentPolyline] = useState([]); // 用于存储当前折线的顶点
  const [size, setSize] = useState({});
  const [flattenedPoints, setFlattenedPoints] = useState([]);
  const [position, setPosition] = useState([0, 0]);
  const [isMouseOverPoint, setMouseOverPoint] = useState(false);
  const [isPolyComplete, setPolyComplete] = useState(false);
  const [drawingMode, setDrawingMode] = useState("polygon"); // 用于存储当前的绘制模式

  const videoElement = useMemo(() => {
    const element = new window.Image();
    element.width = 650;
    element.height = 302;
    element.src = videoSource;
    return element;
  }, [videoSource]);

  useEffect(() => {
    const onload = function () {
      setSize({
        width: videoElement.width,
        height: videoElement.height,
      });
      setImage(videoElement);
      imageRef.current = videoElement;
    };
    videoElement.addEventListener("load", onload);
    return () => {
      videoElement.removeEventListener("load", onload);
    };
  }, [videoElement]);

  const getMousePos = (stage) => {
    return [stage.getPointerPosition().x, stage.getPointerPosition().y];
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);

    if (e.evt.button === 2) { // 检测右键点击
      if (drawingMode === "polyline" && currentPolyline.length > 0) {
        setPolylines([...polylines, currentPolyline]); // 结束折线绘制
        setCurrentPolyline([]);
      }
      setDrawingMode("none"); // 右键点击结束后进入“无画图”状态
      return;
    }

    if (drawingMode === "line") {
      if (currentLine.length === 0) {
        setCurrentLine([mousePos]);
      } else {
        setLines([...lines, [...currentLine, mousePos]]);
        setCurrentLine([]);
        setDrawingMode("none"); // 右键点击结束后进入“无画图”状态
      }
    } else if (drawingMode === "polyline") {
      setCurrentPolyline([...currentPolyline, mousePos]);
    } else if (drawingMode === "polygon") {
      if (isPolyComplete) {
        return;
      }
      if (isMouseOverPoint && currentPoints.length >= 3) {
        setPolygons([...polygons, currentPoints]);
        setCurrentPoints([]);
        setPolyComplete(false);
        setDrawingMode("none"); // 右键点击结束后进入“无画图”状态
      } else {
        setCurrentPoints([...currentPoints, mousePos]);
      }
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setPosition(mousePos);
  };

  const handleMouseOverStartPoint = (e) => {
    if (isPolyComplete || currentPoints.length < 3) return;
    e.target.scale({ x: 3, y: 3 });
    setMouseOverPoint(true);
  };

  const handleMouseOutStartPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
    setMouseOverPoint(false);
  };

  const handlePointDragMove = (e) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    setCurrentPoints([...currentPoints.slice(0, index), pos, ...currentPoints.slice(index + 1)]);
  };

  useEffect(() => {
    setFlattenedPoints(
        currentPoints
            .concat(isPolyComplete ? [] : position)
            .reduce((a, b) => a.concat(b), [])
    );
  }, [currentPoints, isPolyComplete, position]);

  const undo = () => {
    if (drawingMode === "line") {
      setCurrentLine([]);
      setLines(lines.slice(0, -1));
    } else if (drawingMode === "polyline") {
      setCurrentPolyline(currentPolyline.slice(0, -1));
    } else if (drawingMode === "polygon") {
      setCurrentPoints(currentPoints.slice(0, -1));
      setPolyComplete(false);
      setPosition(currentPoints[currentPoints.length - 1]);
    }
  };

  const reset = () => {
    if (drawingMode === "line") {
      setCurrentLine([]);
      setLines([]);
    } else if (drawingMode === "polyline") {
      setCurrentPolyline([]);
    } else if (drawingMode === "polygon") {
      setCurrentPoints([]);
      setPolyComplete(false);
    }
  };

  const renderAnnotations = () => {
    return (
        <Layer>
          {polygons.map((points, index) => (
              <PolygonAnnotation
                  key={index}
                  points={points}
                  flattenedPoints={points.reduce((a, b) => a.concat(b), [])}
                  isFinished={true}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  handleMouseOverStartPoint={handleMouseOverStartPoint}
                  handleMouseOutStartPoint={handleMouseOutStartPoint}
              />
          ))}
          {lines.map((points, index) => (
              <DraggableLine
                  key={index}
                  points={points}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  stroke="#00F1FF"
                  strokeWidth={3}
              />
          ))}
          {polylines.map((points, index) => (
              <DraggableLine
                  key={index}
                  points={points}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  stroke="#00F1FF"
                  strokeWidth={3}
              />
          ))}
          {currentPoints.length > 0 && (
              <PolygonAnnotation
                  points={currentPoints}
                  flattenedPoints={flattenedPoints}
                  isFinished={isPolyComplete}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  handleMouseOverStartPoint={handleMouseOverStartPoint}
                  handleMouseOutStartPoint={handleMouseOutStartPoint}
              />
          )}
          {currentLine.length > 0 && (
              <DraggableLine
                  points={[...currentLine, position]}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  stroke="#00F1FF"
                  strokeWidth={3}
              />
          )}
          {currentPolyline.length > 0 && (
              <DraggableLine
                  points={[...currentPolyline, position]}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={() => {}}
                  stroke="#00F1FF"
                  strokeWidth={3}
              />
          )}
        </Layer>
    );
  };

  return (
      <div>
        <div style={columnStyle}>
          <Button handleClick={undo}>撤销</Button>
          <Button handleClick={reset}>重置</Button>
          <label>
            <input
                type="radio"
                value="polygon"
                checked={drawingMode === "polygon"}
                onChange={() => setDrawingMode("polygon")}
            />
            画多边形
          </label>
          <label>
            <input
                type="radio"
                value="line"
                checked={drawingMode === "line"}
                onChange={() => setDrawingMode("line")}
            />
            画直线
          </label>
          <label>
            <input
                type="radio"
                value="polyline"
                checked={drawingMode === "polyline"}
                onChange={() => setDrawingMode("polyline")}
            />
            画折线
          </label>
          <label>
            <input
                type="radio"
                value="none"
                checked={drawingMode === "none"}
                onChange={() => setDrawingMode("none")}
            />
            无画图
          </label>

        </div>
        <div style={wrapperStyle}>
          <Stage
              width={size.width}
              height={size.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
          >
            <Layer>
              <Image image={image} ref={dataRef} />
            </Layer>
            {renderAnnotations()}
          </Stage>
        </div>
      </div>
  );
};

export default Canvas;
