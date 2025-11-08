import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva'; // Imported for debug purposes
import {createNoise2D} from 'simplex-noise';
import { useState } from 'react';
import { useRef, useEffect } from "react";
import * as THREE from "three";
import Tree from "./Tree.js";
import Cloud from "./Cloud.js";

// ----------
// MAJOR TODO: Merge meshes where possible to avoid performance issues.
// 
// ----------


function HexGeomtry({height, position, radius, colour}) {
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

/**
 * Generates a procedurally generated hexagonal grid with trees placed on random tiles
 * 
 * Perlin noise used to determine hex height
 * Terrain type/colouring adjustable via leva UI controls
 * 
 * @param {number} gridRadius - the size of the grid
 * @param {number} hexRadius - the size of each tile
 * @param {number} maxHeight - the height that the tiles will top out at
 * @param {number} heightVariance - how much the height varies between each tile
 * @returns {JSX.element}
 */
function GenerateMap({gridRadius, hexRadius, maxHeight, heightVariance}) {
    const tiles = [];
    const trees = [];
    const possibleTreeModels = ["Oak", "Spruce", "Birch", "Tree_Stump"];

    const palette = {
        "dirt": '#582F0E', 
        "ldirt": '#7F4F24',
        "lgrass": '#656D4A',
        "grass": "#414833",
        "mountain": "#728071",
        "water": "#0E86CC"    
    }


    // DEBUG UI
    const {dirtHeightUI, ldirtHeightUI, lGrassHeightUI, grassHeightUI, waterHeightUI} = useControls({
    dirtHeightUI : {value: 1.5, min: 0, max: 20, step: 0.25 },
    ldirtHeightUI : { value: 2.5, min: 0, max: 20, step: 0.25 }, 
    lGrassHeightUI : { value: 5, min: 0, max: 20, step: 0.25 },
    grassHeightUI : { value: 9.75, min: 0, max: 20, step: 0.25 },
    waterHeightUI : { value: 0.5, min: 0, max: 20, step: 0.25 }
});

    // Noise Consts
    const dirtHeight = maxHeight * dirtHeightUI;
    const lowDirtHeight = maxHeight * ldirtHeightUI;
    const lowGrassHeight = maxHeight * lGrassHeightUI;

    // Scale up to make water dominate dirt, scale down to do the opposite
    const waterHeight = maxHeight * waterHeightUI; 
    const grassHeight = maxHeight * grassHeightUI;

    const TREE_FREQUENCY = 0.965
    const FREQUENCY = 0.1;
    //const FREQUENCY2 = 0.2;
    // https://www.npmjs.com/package/simplex-noise -> look into this for creating unique seed for each sub and storing it in database MAYBE????????
    const noise2D = createNoise2D();

    // Generates pointy top - axial hexagonal grid
    // https://www.redblobgames.com/grids/tiles/ THANK YOU RED BLOB GAMES
    for (let q = -gridRadius; q <= gridRadius; q++) {
        for (let r = -gridRadius; r < gridRadius; r++) {
            // Noise
            let tileHeight = (noise2D(r * FREQUENCY, q * FREQUENCY) + 1) * 0.5;
            tileHeight = Math.pow(tileHeight, 1.5) * heightVariance;
            tileHeight = tileHeight * maxHeight;

            /** 
            let variance = (noise2D(r * FREQUENCY2, q * FREQUENCY2) + 1) * 0.5;
            variance = Math.pow(variance, 1.5) * heightVariance;
            variance = variance * maxHeight;
            */
            
            if (Math.abs(q + r) > gridRadius) continue; // constraint q + r + s = 0
            const x = hexRadius * Math.sqrt(3) * (q + r/2);
            const y = hexRadius * 3/2 * r;
            
            /** 
             * This creates a colouring scheme where each tile type has its own height interval (sort of like a layered cake)
             * the block checks the tile's height starting from the lowest interval and moves up an interval each time.
             * Once it finds the correct interval, it sets the tile's type to the interval's type.
             * If no appropriate interval is found in time then it reaches/defaults to 'mountain', the highest interval.
             * */ 
            let tileType = palette["mountain"]; // Defines tileType and sets the default tile type, voiding need of 'else' (two birds one stone)
            let isWater = false;
            if (tileHeight < waterHeight) {
                tileType = palette["water"];
                isWater = true;
            }
            else if(tileHeight < dirtHeight) {
                tileType = palette["dirt"];
            } else if(tileHeight < lowDirtHeight) {
                tileType = palette["ldirt"];
            } else if(tileHeight < lowGrassHeight) {
                tileType = palette["lgrass"];
            } else if(tileHeight < grassHeight) {
                tileType = palette["grass"];
            }

            tiles.push({ x, y, height: tileHeight, hexRadius, colour: tileType});

            // Select random tree model from possible models
            const random = Math.floor(Math.random() * possibleTreeModels.length);
            const chosenTreeModel = possibleTreeModels[random];
            
            // Determines if a tree is placed on current tile
            if(Math.random() > TREE_FREQUENCY && !(isWater)) {
                trees.push({x, y, height: tileHeight, chosenTreeModel})
                //console.log(model);
            }

        }
    }

    return (
        <mesh>
        {tiles.map((pos, index) => (
            <HexGeomtry 
            key={index} 
            height={pos.height} 
            position={new THREE.Vector2(pos.x, pos.y)} 
            radius={pos.hexRadius} 
            colour={pos.colour} />
        ))}
        {trees.map((pos, index) => (
            <Tree 
            key={index} 
            height={pos.height} 
            position={new THREE.Vector2(pos.x, pos.y)} 
            model={pos.chosenTreeModel}/>
        ))}
        </mesh>
    )
}


export default function HexMap() {
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
                        position: [10, 80, 400], // TODO: change this to be based on the size of the generated map
                        fov: 80
                    }}
                    shadows
                >
                
                <directionalLight position={[10, 80, 300]} intensity = {1} castShadow />
                
                <color attach="background" args={[backgroundColor]}/>

                <Environment 
                // 360 degree image of environment that helps simulates reflections, lightining. Is essential
                files="assets/envmap.hdr" // Environment auto handles loading of envMap using RGBELoader: https://drei.docs.pmnd.rs/staging/environment
                /> 

                <GenerateMap gridRadius={35} hexRadius={5} maxHeight={5} heightVariance={15} castShadow/>

                <Cloud/>

                <OrbitControls target={[centerX, 10, centerY + 5]}/>
            </Canvas>
        </div>
    )
}