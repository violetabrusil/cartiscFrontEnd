import "../VechiclePlans.css"
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';
import useCSSVar from "../hooks/UseCSSVar";

const VehiclePlans = ({ imgSrc, updatePoints, initialPoints = [], isEditable = true }) => {

    const [points, setPoints] = useState(initialPoints);
    const [image] = useImage(imgSrc);
    const imageWidth = 550;
    const imageHeight = 450;
    const yellowNeon = useCSSVar('--yellow-neon');

    const handleStageClick = (event) => {
        if (!isEditable) return;
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
    };
    

    const handleDragEnd = (index) => (event) => {
        const newPoints = [...points];

        // Redondear las coordenadas
        const roundedX = Math.round(event.target.x());
        const roundedY = Math.round(event.target.y());

        // Determinar el lado
        const side = roundedX < imageWidth / 2 ? 'left' : 'right';
        newPoints[index] = {
            ...newPoints[index],
            x: roundedX,
            y: roundedY,
            side
        };

        setPoints(newPoints);
        if (updatePoints) {
            updatePoints(newPoints);
        }
    };

    useEffect(() => {
        setPoints(initialPoints);
    }, []);


    return (
        <div className="container-vehicle-plan">
            <div style={{ margin: '20px' }}>
                <Stage width={imageWidth} height={imageHeight} onClick={handleStageClick} onTouchStart={handleStageClick}>
                    <Layer>
                        <Image image={image}
                            width={imageWidth}
                            height={imageHeight}
                            x={(imageWidth - imageWidth) / 2}
                            y={(imageHeight - imageHeight) / 2} />
                        {points.map((point, index) => (
                            <Circle key={index} x={point.x} y={point.y} radius={10} fill={yellowNeon}
                                draggable={isEditable}
                                onClick={() => handleDragEnd(index)()}
                                onDragEnd={handleDragEnd(index)} />
                        ))}
                    </Layer>
                </Stage>

            </div>


        </div>
    )
}

export default VehiclePlans;