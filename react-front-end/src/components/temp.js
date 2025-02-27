import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import {createNoise2D} from 'simplex-noise';
import { useState } from 'react';
import { useRef, useEffect } from "react";
import * as THREE from "three";



function HexGeomtry({height, position}) {
    const refToHex = useRef();
    const [hovered, setHovered] = useState(false);

    const palette = {
        "default" : "#d5d8de",
        "dirt" : "#1a0a09",
        "grass" : "#62806a"
    };

    useEffect(() => {
        if (refToHex.current) {
            refToHex.current.position.set(position.x, height*0.5, position.y)
        }
      }, [position, height]);

    return (
        <mesh 
            ref={refToHex} 
            onPointerOver={() => setHovered(true)} // https://codesandbox.io/p/sandbox/ny3p4?file=%2Fsrc%2FApp.js%3A45%2C47
            onPointerOut={() => setHovered(false)}
            >
            {/*TODO: Make this scale with everything else so changing hexagon dimensions doesn't nuke everything else */}
            <cylinderGeometry args={[1, 1, height, 6, 1]}/>
            <meshStandardMaterial color={hovered ? palette.dirt : palette.default} flatShading/> 
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

      const [titleText, setTitleText] = useState('');
      // TEMPORARY - MOVE TO SEPARATE FUNCTION LATER
    useEffect(() => {
        fetch('/message')
            .then((res) => res.json())
            .then((data) => {
            setTitleText(data.title);
        });
    }, []); // Empty dependency array to run once on mount

      
    // Hexagon Consts ( CALCULATIONS ARE FOR FLAT TOP GRID )
    const hexagons = [];
    const rows = 40;
    const cols = 40;
    const gridRadius = 30;

    const SIN_60 = Math.sin(1.042);
    const HEX_RADIUS = 1; // Defined in HexGeometry : cylinderGeometry arg 1,2
    const spacing = Math.sqrt(3) * HEX_RADIUS;

    // Noise Consts
    const HEIGHT_VARIANCE = 8;
    const FRQUENCY = 0.1;
    // https://www.npmjs.com/package/simplex-noise -> look into this for creating unique seed for each sub and storing it into database MAYBE????????
    const noise2D = createNoise2D();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Noise
            let noise = (noise2D(row * FRQUENCY, col * FRQUENCY) + 1) * 0.5;
            noise = Math.pow(noise, 1.5) * HEIGHT_VARIANCE;
            
            // Spacing ( Doubled coordinates )
            // q = col
            // r = row
            const x = col * spacing + (row % 2 === 0 ? spacing / 2 : 0);
            const y = (row * spacing * SIN_60); 
 
            
            hexagons.push({ x, y, noise});
        }
    }

    const centerX = (cols - 1) * spacing / 2;
    const centerY = (rows - 1) * spacing * 0.866 / 2;
    const centerPosition = new THREE.Vector3(centerX, 0, centerY);

    return (
        <div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>
                <Canvas
                    camera={{
                        position: [centerX, 40, 50], // TODO: change this to be based on the size of the generated map
                        fov: 80
                    }}
                >
                
                <directionalLight position={[3.3, 1.0, 4.4]} intensity={1} />
                <color attach="background" args={["ivory"]}/>
                <Environment 
                files="assets/envmap.hdr" // Environment auto handles loading of envMap using RGBELoader: https://drei.docs.pmnd.rs/staging/environment
                /> 

                {/* REPLACE THIS FUCKING BULLSHIT WITH A MESH SO THERE AREN't 1000000 DRAW CALLS */}   
                {hexagons.map((pos, index, noise) => (
                    <HexGeomtry key={index} height={pos.noise} position={new THREE.Vector2(pos.x, pos.y)} />
                ))}
                
                {/*
                <Text color="black" position={[centerX, 15, 0]} fontSize={5}> 
                    {titleText || "...Loading"}
                </Text>
                */}

                <OrbitControls target={[centerX, 10, centerY + 5]} enablePan={false} autoRotate/>
            </Canvas>
        </div>
    )
}