import React, { useState } from "react";
import { Line, Circle, Group } from "react-konva";
import { minMax, dragBoundFunc } from "utils";
/**
 *
 * @param {minMaxX} props
 * minMaxX[0]=>minX
 * minMaxX[1]=>maxX
 *
 */
const PolygonAnnotation = (props) => {
  const {
    points, // 多边形的顶点坐标数组
    flattenedPoints, // 展平的顶点坐标数组，用于Konva的Line组件
    isFinished, // 布尔值，表示多边形是否绘制完成
    handlePointDragMove, // 顶点拖动时的回调函数
    handleGroupDragEnd, // 多边形整体拖动结束时的回调函数
    handleMouseOverStartPoint, // 鼠标悬停在第一个顶点时的回调函数
    handleMouseOutStartPoint, // 鼠标移出第一个顶点时的回调函数
  } = props;
  const vertexRadius = 6; // 顶点的半径

  const [stage, setStage] = useState(); // 存储Konva的Stage对象
  const handleGroupMouseOver = (e) => {
    if (!isFinished) return; // 如果多边形没有绘制完成，直接返回
    e.target.getStage().container().style.cursor = "move"; // 设置鼠标指针样式为“移动”
    setStage(e.target.getStage()); // 更新Stage对象
  };
  const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = "default"; // 将鼠标指针样式重置为默认值
  };
  const [minMaxX, setMinMaxX] = useState([0, 0]); // 存储顶点在X轴上的最小值和最大值
  const [minMaxY, setMinMaxY] = useState([0, 0]); // 存储顶点在Y轴上的最小值和最大值
  const handleGroupDragStart = (e) => {
    let arrX = points.map((p) => p[0]); // 提取所有顶点的X坐标
    let arrY = points.map((p) => p[1]); // 提取所有顶点的Y坐标
    setMinMaxX(minMax(arrX)); // 计算并设置X坐标的最小值和最大值
    setMinMaxY(minMax(arrY)); // 计算并设置Y坐标的最小值和最大值
  };
  const groupDragBound = (pos) => {
    let { x, y } = pos;
    const sw = stage.width(); // 获取Stage的宽度
    const sh = stage.height(); // 获取Stage的高度
    if (minMaxY[0] + y < 0) y = -1 * minMaxY[0]; // 限制多边形拖动不超出上边界
    if (minMaxX[0] + x < 0) x = -1 * minMaxX[0]; // 限制多边形拖动不超出左边界
    if (minMaxY[1] + y > sh) y = sh - minMaxY[1]; // 限制多边形拖动不超出下边界
    if (minMaxX[1] + x > sw) x = sw - minMaxX[1]; // 限制多边形拖动不超出右边界
    return { x, y }; // 返回新的坐标
  };
  return (
      <Group
          name="polygon"
          draggable={isFinished} // 只有在多边形绘制完成后才可拖动
          onDragStart={handleGroupDragStart} // 设置拖动开始时的回调函数
          onDragEnd={handleGroupDragEnd} // 设置拖动结束时的回调函数
          dragBoundFunc={groupDragBound} // 设置拖动限制函数
          onMouseOver={handleGroupMouseOver} // 设置鼠标悬停时的回调函数
          onMouseOut={handleGroupMouseOut} // 设置鼠标移出时的回调函数
      >
        <Line
            points={flattenedPoints} // 设置多边形顶点
            stroke="#00F1FF" // 设置多边形边框颜色
            strokeWidth={3} // 设置多边形边框宽度
            closed={isFinished} // 多边形是否闭合
            fill="rgb(140,30,255,0.5)" // 设置多边形填充颜色和透明度
        />
        {points.map((point, index) => {
          const x = point[0] - vertexRadius / 2; // 计算顶点的X坐标
          const y = point[1] - vertexRadius / 2; // 计算顶点的Y坐标
          const startPointAttr =
              index === 0
                  ? {
                    hitStrokeWidth: 12, // 设置第一个顶点的点击范围
                    onMouseOver: handleMouseOverStartPoint, // 设置鼠标悬停在第一个顶点时的回调函数
                    onMouseOut: handleMouseOutStartPoint, // 设置鼠标移出第一个顶点时的回调函数
                  }
                  : null;
          return (
              <Circle
                  key={index}
                  x={x}
                  y={y}
                  radius={vertexRadius} // 设置顶点的半径
                  fill="#FF019A" // 设置顶点的填充颜色
                  stroke="#00F1FF" // 设置顶点的边框颜色
                  strokeWidth={2} // 设置顶点的边框宽度
                  draggable // 设置顶点可拖动
                  onDragMove={handlePointDragMove} // 设置顶点拖动时的回调函数
                  dragBoundFunc={(pos) =>
                      dragBoundFunc(stage.width(), stage.height(), vertexRadius, pos)
                  } // 设置顶点拖动限制函数
                  {...startPointAttr} // 应用第一个顶点的特定属性
              />
          );
        })}
      </Group>
  );
};

export default PolygonAnnotation;
