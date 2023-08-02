import "../VechiclePlans.css"
import React, { useState } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const VehiclePlans = ({ imgSrc }) => {

    const [points, setPoints] = useState([]);
    const [image] = useImage(imgSrc);
    const imageWidth = 550;
    const imageHeight = 450;

    const handleStageClick = (event) => {
        // Update the points state with the new point
        const stage = event.currentTarget;
        const point = stage.getPointerPosition();
        setPoints([...points, point]);
        console.log("los puntos 1", point);
        console.log("los puntos", points);
    };

    const handleDragEnd = (index) => (event) => {
        const newPoints = [...points];
        newPoints[index] = { x: event.target.x(), y: event.target.y() };
        setPoints(newPoints);
      };

    return (
        <div className="container-vehicle-plan">
            <Stage width={imageWidth} height={imageHeight} onClick={handleStageClick}>
                <Layer>
                    <Image image={image}
                        width={imageWidth}
                        height={imageHeight}
                        x={(imageWidth - imageWidth) / 2}
                        y={(imageHeight - imageHeight) / 2} />
                    {points.map((point, index) => (
                        <Circle key={index} x={point.x} y={point.y} radius={10} fill="#ffea00"
                        draggable
                        onDragEnd={handleDragEnd(index)} />
                    ))}
                </Layer>
            </Stage>

        </div>
    )
}

export default VehiclePlans;