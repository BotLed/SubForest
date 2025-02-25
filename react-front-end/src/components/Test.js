import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber"
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from "three";



function HexGeomtry({height, position}) {
    const ref = useRef()

    useEffect(() => {
        if (ref.current) {
            ref.current.position.set(position.x, height*0.5, position.y)
        }
      }, [position, height]);

    return (
        <mesh ref={ref}>
            <cylinderGeometry args={[1, 1, height, 6, 1]}/>
        
            <meshStandardMaterial/>
        </mesh>
    )
}

// To test environment map
function ReflectiveSphere() {
    return (
        <mesh>
            <sphereGeometry args={[5, 10, 10]} />
            <meshStandardMaterial metalness={1} roughness={0}/>
        </mesh>
    )
}

export default function Test() {
    const handleClick = () => {
        fetch(`/message`)
          .then((res) => res.json())
          .then((data) => alert(data.title)); // Show Reddit post title
      };

    const hexagons = [];
    const rows = 20;
    const cols = 15;
    const spacing = 1.9;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Offset odd rows to make a hexagonal pattern
            const x = col * spacing + (row % 2 === 0 ? spacing / 2 : 0);
            const y = row * spacing * 0.866; // 0.866 = sin(60°), to space hexagons properly
            hexagons.push({ x, y });
        }
    }

    const centerX = (cols - 1) * spacing / 2;
    const centerY = (rows - 1) * spacing * 0.866 / 2;
    const centerPosition = new THREE.Vector3(centerX, 0, centerY);

    return (

        <div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>
                <Canvas
                    camera={{
                        position: [10, 20, 50], // Set camera above center
                    }}
                >
                <Environment
                    files="assets/envmap.hdr"
                />

                <color />
                <directionalLight position={[3.3, 1.0, 4.4]} intensity={4} />

                {hexagons.map((pos, index) => (
                    <HexGeomtry key={index} height={2} position={new THREE.Vector2(pos.x, pos.y)} />
                ))}

                <OrbitControls target={[centerX, 10, centerY + 5]}/>
            </Canvas>
        </div>
    )
}