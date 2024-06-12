import React, { useState } from "react";
import { Line, Circle, Group } from "react-konva";
import { minMax, dragBoundFunc } from "utils";

const DraggableLine = ({ points, handlePointDragMove, handleGroupDragEnd, stroke, strokeWidth }) => {
    const [stage, setStage] = useState();
    const [minMaxX, setMinMaxX] = useState([0, 0]);
    const [minMaxY, setMinMaxY] = useState([0, 0]);

    const handleGroupMouseOver = (e) => {
        e.target.getStage().container().style.cursor = "move";
        setStage(e.target.getStage());
    };

    const handleGroupMouseOut = (e) => {
        e.target.getStage().container().style.cursor = "default";
    };

    const handleGroupDragStart = () => {
        let arrX = points.map((p) => p[0]);
        let arrY = points.map((p) => p[1]);
        setMinMaxX(minMax(arrX));
        setMinMaxY(minMax(arrY));
    };

    const groupDragBound = (pos) => {
        let { x, y } = pos;
        const sw = stage.width();
        const sh = stage.height();
        if (minMaxY[0] + y < 0) y = -1 * minMaxY[0];
        if (minMaxX[0] + x < 0) x = -1 * minMaxX[0];
        if (minMaxY[1] + y > sh) y = sh - minMaxY[1];
        if (minMaxX[1] + x > sw) x = sw - minMaxX[1];
        return { x, y };
    };

    const flattenedPoints = points.reduce((a, b) => a.concat(b), []);
    const vertexRadius = 6;

    return (
        <Group
            draggable
            onDragStart={handleGroupDragStart}
            onDragEnd={handleGroupDragEnd}
            dragBoundFunc={groupDragBound}
            onMouseOver={handleGroupMouseOver}
            onMouseOut={handleGroupMouseOut}
        >
            <Line
                points={flattenedPoints}
                stroke={stroke}
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
            />
            {points.map((point, index) => {
                const x = point[0] - vertexRadius / 2;
                const y = point[1] - vertexRadius / 2;
                return (
                    <Circle
                        key={index}
                        x={x}
                        y={y}
                        radius={vertexRadius}
                        fill="#FF019A"
                        stroke="#00F1FF"
                        strokeWidth={2}
                        draggable
                        onDragMove={handlePointDragMove}
                        dragBoundFunc={(pos) => dragBoundFunc(stage.width(), stage.height(), vertexRadius, pos)}
                    />
                );
            })}
        </Group>
    );
};

export default DraggableLine;
