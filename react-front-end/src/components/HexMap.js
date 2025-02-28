import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import {createNoise2D} from 'simplex-noise';
import { useState } from 'react';
import { useLoader } from '@react-three/fiber'
import { useRef, useEffect } from "react";
import * as THREE from "three";



function HexGeomtry({height, position, radius, colour}) {
    const refToHex = useRef();
    const [hovered, setHovered] = useState(false);
    {/*
    const [grass] = useLoader(THREE.TextureLoader, [
    '/assets/grass.png'
    ])
    */}

    useEffect(() => {
        if (refToHex.current) {
            refToHex.current.position.set(position.x, height*0.5, position.y);
        }
      }, [position, height, hovered]);

    return (
        <mesh 
        ref={refToHex} 
        onPointerOver={(e) => {
            e.stopPropagation(); // Stops event from reaching further objects
            setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        >
            <cylinderGeometry args={[radius, radius, height, 6, 1]}/>
            <meshStandardMaterial color={hovered ? "red" : colour} flatShading/> 
        </mesh>
    )
}


function GenerateMap({gridRadius, hexRadius, maxHeight, heightVariance}) {
    const hexagons = [];
    const palette = {
        "grass": "#d4ccb4",
        "stone": "#74707c",
        "dirt": "#202436"

        //"default" : "#d5d8de",
        //"dirt" : "#1a0a09",
        //"grass" : "#62806a"
    };

    // Noise Consts
    const DIRT_HEIGHT = maxHeight * 4;
    const STONE_HEIGHT = maxHeight * 8;

    const FREQUENCY = 0.1;
    // https://www.npmjs.com/package/simplex-noise -> look into this for creating unique seed for each sub and storing it into database MAYBE????????
    const noise2D = createNoise2D();

    // Generates pointy top - axial hexagonal grid
    // https://www.redblobgames.com/grids/hexagons/ THANK YOU RED BLOB GAMES
    for (let q = -gridRadius; q <= gridRadius; q++) {
        for (let r = -gridRadius; r < gridRadius; r++) {
            // Noise
            let noise = (noise2D(r * FREQUENCY, q * FREQUENCY) + 1) * 0.5;
            noise = Math.pow(noise, 1.5) * heightVariance;
            noise = noise * maxHeight;

            if (Math.abs(q + r) > gridRadius) continue; // constraint q + r + s = 0
            const x = hexRadius * Math.sqrt(3) * (q + r/2);
            const y = hexRadius * 3/2 * r;

            let colour = palette.grass;
            if(noise < DIRT_HEIGHT) {
                colour = palette.dirt;
            } else if(noise < STONE_HEIGHT) {
                colour = palette.stone;
            }

            hexagons.push({ x, y, noise, hexRadius, colour});
        }
    }

    return (
        <mesh>
        {hexagons.map((pos, index) => (
            <HexGeomtry 
            key={index} 
            height={pos.noise} 
            position={new THREE.Vector2(pos.x, pos.y)} 
            radius={pos.hexRadius} 
            colour={pos.colour} />
        ))}
        </mesh>
    )
}


export default function Test() {
      const [titleText, setTitleText] = useState('');
      // TEMPORARY - MOVE TO SEPARATE FUNCTION LATER
    useEffect(() => {
        fetch('/message')
            .then((res) => res.json())
            .then((data) => {
            setTitleText(data.title);
        });
    }, []); // Empty dependency array to run once on mount

    const centerX = 0;
    const centerY = 0;
    const backgroundColor = "ivory";
    return (
        <div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>
                <Canvas
                    camera={{
                        position: [centerX, 40, 50], // TODO: change this to be based on the size of the generated map
                        fov: 80
                    }}
                >
                <ambientLight intensity={0.2}/>
                <color attach="background" args={[backgroundColor]}/>
                <Environment 
                files="assets/envmap.hdr" // Environment auto handles loading of envMap using RGBELoader: https://drei.docs.pmnd.rs/staging/environment
                /> 

                <GenerateMap gridRadius={35} hexRadius={5} maxHeight={4} heightVariance={15}/>
                
                
                {/*
                <Text color="black" position={[centerX, 15, 0]} fontSize={5}> 
                    {titleText || "...Loading"}
                </Text>
                */}

                <OrbitControls target={[centerX, 10, centerY + 5]}/>
            </Canvas>
        </div>
    )
}