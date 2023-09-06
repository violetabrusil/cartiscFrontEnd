import "../VechiclePlans.css"
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const VehiclePlans = ({ imgSrc, updatePoints, initialPoints = [] }) => {

    const [points, setPoints] = useState(initialPoints);
    const [image] = useImage(imgSrc);
    const imageWidth = 550;
    const imageHeight = 450;

    const handleStageClick = (event) => {
        // Update the points state with the new point
        const stage = event.currentTarget;
        const point = stage.getPointerPosition();

        // Redondear las coordenadas
        const roundedX = Math.round(point.x);
        const roundedY = Math.round(point.y);

        // Determinar el lado
        const side = roundedX < imageWidth / 2 ? 'left' : 'right';

        const pointWithSide = { x: roundedX, y: roundedY, side };

        setPoints([...points, pointWithSide]);
        if (updatePoints) {
            updatePoints([...points, pointWithSide]);
        }
        console.log("los puntos 1", pointWithSide);
        console.log("los puntos", points);
    };

    const handleDragEnd = (index) => (event) => {
        const newPoints = [...points];

        // Redondear las coordenadas
        const roundedX = Math.round(event.target.x());
        const roundedY = Math.round(event.target.y());

        // Determinar el lado
        const side = roundedX < imageWidth / 2 ? 'left' : 'right';
        newPoints[index] = { x: roundedX, y: roundedY, side };
        
        setPoints(newPoints);
        if (updatePoints) {
            updatePoints(newPoints);
        }
    };

    useEffect(() => {
        setPoints(initialPoints);
    }, [initialPoints]);
    

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