import "../VechiclePlans.css"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';

const VEHICLE_IMAGES = {
    car: process.env.PUBLIC_URL + "/images/vehicle-plans/car.webp",
    suv: process.env.PUBLIC_URL + "/images/vehicle-plans/suv.webp",
    van: process.env.PUBLIC_URL + "/images/vehicle-plans/van.webp",
    pickup_truck: process.env.PUBLIC_URL + "/images/vehicle-plans/pickup_truck.webp",
    truck: process.env.PUBLIC_URL + "/images/vehicle-plans/truck.webp",
};

const STANDARD_WIDTH = 1200;
const STANDARD_HEIGHT = 600;
const EMPTY_POINTS = [];

const VehiclePlans = ({ vehicleType = 'car', updatePoints, initialPoints = EMPTY_POINTS, isEditable: initialIsEditable = true }) => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const pointsRef = useRef([]);
    const [stageSize, setStageSize] = useState({ width: STANDARD_WIDTH, height: STANDARD_HEIGHT });
    const [points, setPoints] = useState([]);
    const [isEditMode, setIsEditMode] = useState(initialIsEditable);
    const imgSrc = VEHICLE_IMAGES[vehicleType] ?? VEHICLE_IMAGES.car;
    const [image] = useImage(imgSrc);

    useEffect(() => {
        pointsRef.current = points;
    }, [points]);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const aspectRatio = STANDARD_WIDTH / STANDARD_HEIGHT;
                const calculatedHeight = containerWidth / aspectRatio;

                setStageSize({
                    width: Math.max(containerWidth - 16, 300),
                    height: Math.max(calculatedHeight, 200)
                });
            }
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
            resizeObserver.disconnect();
        };
    }, []);

    const toNormalized = (px, py) => ({
        x: px / stageSize.width,
        y: py / stageSize.height
    });

    const addPoint = useCallback((pixelX, pixelY) => {
        const normPoint = toNormalized(pixelX, pixelY);
        const side = pixelX < stageSize.width / 2 ? 'left' : 'right';
        const newPoint = { x: normPoint.x, y: normPoint.y, side };

        const updatedPoints = [...pointsRef.current, newPoint];
        setPoints(updatedPoints);

        const pixelPoints = updatedPoints.map(p => ({
            x: Math.round(p.x * STANDARD_WIDTH),
            y: Math.round(p.y * STANDARD_HEIGHT),
            side: p.side
        }));
        if (updatePoints) updatePoints(pixelPoints);
    }, [stageSize, updatePoints, toNormalized]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isEditMode) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }
        };

        const handleTouchEnd = (e) => {
            if (!e.changedTouches || !e.changedTouches[0]) return;

            const deltaX = Math.abs(e.changedTouches[0].clientX - startX);
            const deltaY = Math.abs(e.changedTouches[0].clientY - startY);
            const deltaTime = Date.now() - startTime;

            if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                if (stageRef.current) {
                    const pointerPos = stageRef.current.getPointerPosition();
                    if (pointerPos) {
                        addPoint(pointerPos.x, pointerPos.y);
                    }
                }
            }
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isEditMode, addPoint]);

    useEffect(() => {
        if (initialPoints && initialPoints.length > 0) {
            const normalizedPoints = initialPoints.map(point => {
                const isNormalized = point.x <= 1 && point.y <= 1;
                if (isNormalized) {
                    return point;
                }
                return {
                    x: point.x / STANDARD_WIDTH,
                    y: point.y / STANDARD_HEIGHT,
                    side: point.side
                };
            });
            setPoints(normalizedPoints);
        }
    }, [initialPoints]);

    useEffect(() => {
        if (!initialPoints || initialPoints.length === 0) {
            setPoints([]);
        }
    }, [vehicleType, initialPoints]);

    const getImageDimensions = () => {
        if (!image) return { w: stageSize.width, h: stageSize.height, x: 0, y: 0 };

        const ratio = Math.min(stageSize.width / image.width, stageSize.height / image.height);
        const w = image.width * ratio;
        const h = image.height * ratio;
        const x = (stageSize.width - w) / 2;
        const y = (stageSize.height - h) / 2;

        return { w, h, x, y };
    };

    const { w, h, x, y } = getImageDimensions();

    const toPixels = (normPoint) => ({
        x: normPoint.x * stageSize.width,
        y: normPoint.y * stageSize.height
    });

    const handleStageClick = (event) => {
        if (!isEditMode) return;
        const stage = event.currentTarget;
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;
        addPoint(pointerPos.x, pointerPos.y);
    };

    const handleDragEnd = (index) => (event) => {
        const normPoint = toNormalized(event.target.x(), event.target.y());
        const side = event.target.x() < stageSize.width / 2 ? 'left' : 'right';
        const newPoints = [...points];
        newPoints[index] = { x: normPoint.x, y: normPoint.y, side };

        setPoints(newPoints);

        const pixelPoints = newPoints.map(p => ({
            x: Math.round(p.x * STANDARD_WIDTH),
            y: Math.round(p.y * STANDARD_HEIGHT),
            side: p.side
        }));
        if (updatePoints) updatePoints(pixelPoints);
    };

    const undoLastPoint = () => {
        if (points.length === 0) return;
        const updatedPoints = points.slice(0, -1);
        setPoints(updatedPoints);

        const pixelPoints = updatedPoints.map(p => ({
            x: Math.round(p.x * STANDARD_WIDTH),
            y: Math.round(p.y * STANDARD_HEIGHT),
            side: p.side
        }));
        if (updatePoints) updatePoints(pixelPoints);
    };

    const clearAllPoints = () => {
        setPoints([]);
        if (updatePoints) updatePoints([]);
    };

    return (
        <>
            {/* Panel de Control */}
            <div style={{
                marginBottom: '12px',
                padding: '10px',
                backgroundColor: isEditMode ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '6px',
                border: `2px solid ${isEditMode ? '#1976d2' : '#ccc'}`,
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: isEditMode ? '#1976d2' : '#757575',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    {isEditMode ? '✏️ Edición Activa' : '🔒 Edición Desactivada'}
                </button>

                <button
                    onClick={undoLastPoint}
                    disabled={points.length === 0}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: points.length === 0 ? '#ccc' : '#ff6f00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: points.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    ↶ Deshacer
                </button>

                <button
                    onClick={clearAllPoints}
                    disabled={points.length === 0}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: points.length === 0 ? '#ccc' : '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: points.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    🗑️ Limpiar
                </button>

                <span style={{
                    marginLeft: 'auto',
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Puntos: {points.length}
                </span>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="container-vehicle-plan" style={{
                marginBottom: '8px',
                cursor: isEditMode ? 'crosshair' : 'default',
                overflow: 'visible',
                display: 'block',
                touchAction: 'pan-y'
            }}>
                {isEditMode && <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>Haz clic para agregar puntos • Arrastra para mover • Scroll para desplazarse</p>}

                {isEditMode ? (
                    <Stage
                        ref={stageRef}
                        width={stageSize.width}
                        height={stageSize.height}
                        onClick={handleStageClick}
                    >
                        <Layer>
                            <Image image={image} width={w} height={h} x={x} y={y} />
                            {points.map((point, index) => {
                                const pixelCoord = toPixels(point);
                                return (
                                    <React.Fragment key={index}>
                                        <Circle
                                            x={pixelCoord.x}
                                            y={pixelCoord.y}
                                            radius={14}
                                            fill="rgba(255,200,0,0.3)"
                                            stroke="#FFB800"
                                            strokeWidth={1.5}
                                            draggable={true}
                                            onDragEnd={handleDragEnd(index)}
                                        />
                                        <Circle
                                            x={pixelCoord.x}
                                            y={pixelCoord.y}
                                            radius={5}
                                            fill="#FFB800"
                                            draggable={true}
                                            onDragEnd={handleDragEnd(index)}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </Layer>
                    </Stage>
                ) : (
                    <div style={{ position: 'relative', width: stageSize.width, height: stageSize.height }}>
                        <img
                            src={imgSrc}
                            alt="Vehicle"
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                objectFit: 'contain',
                                backgroundColor: 'white'
                            }}
                        />
                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none'
                            }}
                        >
                            {points.map((point, index) => {
                                const pixelCoord = {
                                    x: point.x * stageSize.width,
                                    y: point.y * stageSize.height
                                };
                                return (
                                    <g key={index}>
                                        <circle cx={pixelCoord.x} cy={pixelCoord.y} r="14" fill="rgba(255,200,0,0.3)" stroke="#FFB800" strokeWidth="1.5" />
                                        <circle cx={pixelCoord.x} cy={pixelCoord.y} r="5" fill="#FFB800" />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}
            </div>
        </>
    );
}

export default VehiclePlans;
