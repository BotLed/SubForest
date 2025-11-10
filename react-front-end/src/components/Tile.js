import { useState, useRef, useEffect } from "react";

export default function Tile({height, position, radius, colour}) {
    const refToHex = useRef();
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (refToHex.current) {
            refToHex.current.position.set(position.x, height*0.5, position.y);
        }
      }, [position, height, hovered]);

    return (
        <mesh 
        ref={refToHex} 
        onPointerOver={(e) => {
            e.stopPropagation(); // Stops hover effect from affecting other tiles
            setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        >
            <cylinderGeometry args={[radius, radius, height, 6, 1]}/>
            <meshStandardMaterial color={hovered ? "red" : colour} flatShading receiveShadow/> 
        </mesh>
    )
}