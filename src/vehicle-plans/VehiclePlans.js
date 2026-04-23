import "../VechiclePlans.css"
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const VEHICLE_IMAGES = {
    car: process.env.PUBLIC_URL + "/images/vehicle-plans/car.webp",
    suv: process.env.PUBLIC_URL + "/images/vehicle-plans/suv.webp",
    van: process.env.PUBLIC_URL + "/images/vehicle-plans/van.webp",
    pickup_truck: process.env.PUBLIC_URL + "/images/vehicle-plans/pickup_truck.webp",
    truck: process.env.PUBLIC_URL + "/images/vehicle-plans/truck.webp",
};

const STAGE_WIDTH = 1200;
const STAGE_HEIGHT = 600;

const VehiclePlans = ({ vehicleType = 'car', updatePoints, initialPoints = [], isEditable = true }) => {

    const [points, setPoints] = useState(initialPoints);
    const imgSrc = VEHICLE_IMAGES[vehicleType] ?? VEHICLE_IMAGES.car;
    const [image] = useImage(imgSrc);

    const getImageDimensions = () => {
        if (!image) return { w: STAGE_WIDTH, h: STAGE_HEIGHT, x: 0, y: 0 };

        const ratio = Math.min(STAGE_WIDTH / image.width, STAGE_HEIGHT / image.height);
        const w = image.width * ratio;
        const h = image.height * ratio;
        const x = (STAGE_WIDTH - w) / 2;
        const y = (STAGE_HEIGHT - h) / 2;

        return { w, h, x, y };
    };

    const { w, h, x, y } = getImageDimensions();

    const handleStageClick = (event) => {
        if (!isEditable) return;
        const stage = event.currentTarget;
        const point = stage.getPointerPosition();

        const roundedX = Math.round(point.x);
        const roundedY = Math.round(point.y);
        const side = roundedX < STAGE_WIDTH / 2 ? 'left' : 'right';
        const newPoint = { x: roundedX, y: roundedY, side };

        setPoints([...points, newPoint]);
        if (updatePoints) updatePoints([...points, newPoint]);
    };

    const handleDragEnd = (index) => (event) => {
        const newPoints = [...points];
        const roundedX = Math.round(event.target.x());
        const roundedY = Math.round(event.target.y());
        const side = roundedX < STAGE_WIDTH / 2 ? 'left' : 'right';
        newPoints[index] = { ...newPoints[index], x: roundedX, y: roundedY, side };

        setPoints(newPoints);
        if (updatePoints) updatePoints(newPoints);
    };

    useEffect(() => {
        if (initialPoints && initialPoints.length > 0) {
            setPoints(initialPoints);
        }
    }, [initialPoints]);

    useEffect(() => {
        setPoints(initialPoints ?? []);
        if (updatePoints) updatePoints(initialPoints ?? []);
    }, [vehicleType]);

    console.log("vehicle category", vehicleType)

    return (
        <div className="container-vehicle-plan">
            <div style={{ marginBottom: '8px' }}>
                <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} onClick={handleStageClick} onTouchStart={handleStageClick}>
                    <Layer>
                        <Image image={image} width={w} height={h} x={x} y={y} />
                        {points.map((point, index) => (
                            <React.Fragment key={index}>
                                <Circle
                                    x={point.x} y={point.y}
                                    radius={14}
                                    fill="rgba(255,200,0,0.3)"
                                    stroke="#FFB800"
                                    strokeWidth={1.5}
                                    draggable={isEditable}
                                    onDragEnd={handleDragEnd(index)}
                                />
                                <Circle
                                    x={point.x} y={point.y}
                                    radius={5}
                                    fill="#FFB800"
                                    draggable={isEditable}
                                    onDragEnd={handleDragEnd(index)}
                                />
                            </React.Fragment>
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    )
}

export default VehiclePlans;