import "../VechiclePlans.css"
import React, { useState } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const VehiclePlans = ({ imgSrc }) => {

    const stageWidth = 500;
    const stageHeight = 500;
    const [points, setPoints] = useState([]);
    const [image] = useImage(imgSrc);
    const imageWidth = image ? image.width : 0;
    const imageHeight = image ? image.height : 0;


    const handleStageClick = (event) => {
        // Update the points state with the new point
        const stage = event.currentTarget;
        const point = stage.getPointerPosition();
        setPoints([...points, point]);
    };

    return (
        <div>
            <Stage width={stageWidth} height={stageHeight} onClick={handleStageClick}>
                <Layer>
                    <Image image={image}
                        width={imageWidth}
                        height={imageHeight}
                        x={(stageWidth - imageWidth) / 2}
                        y={(stageHeight - imageHeight) / 2} />
                    {points.map((point, index) => (
                        <Circle key={index} x={point.x} y={point.y} radius={10} fill="red" />
                    ))}
                </Layer>
            </Stage>

        </div>
    )
}

export default VehiclePlans;