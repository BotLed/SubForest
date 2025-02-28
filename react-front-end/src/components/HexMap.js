import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva'; // Imported for debug purposes
import {createNoise2D} from 'simplex-noise';
import { useState } from 'react';
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from '@react-three/drei';

// ----------
// MAJOR TODO: Merge meshes where possible to avoid performance issues.
// Comparmenatlize logic so you don't have 700 functions in one component.
// ----------

function Tree({height, position, model}) {
    const MODELS = {
        "Oak" : 'assets/tree.glb',
        "Spruce" : 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-lime/model.gltf',
        "Birch" : 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf',
        "Fall_Tree" : 'assets/fall_tree.glb',
        "Tree_Stump" : 'assets/tree_stump.glb'
    }
    // "Oak", "Spruce", "Birch", "Fall_Tree", "Tree_Stump"

    const { scene } = useGLTF(MODELS[model]);
    const refToTree = useRef();


    useEffect(() => {
        if (refToTree.current) {
            refToTree.current.position.set(position.x, height, position.y);

            //TODO: make the models equal size in Blender to avoid scaling
            if(model == "Oak" || model == "Fall_Tree") {
                refToTree.current.scale.set(20, 20, 20);
            }
            if(model == "Tree_Stump") {
                refToTree.current.scale.set(50, 50, 50);
            }
            if(model == "Spruce" || model == "Birch") {
                refToTree.current.scale.set(2, 2, 2);
            }

        }
      }, [position, height]);

    return (
        <group castShadow>
        <primitive ref={refToTree} object={scene.clone()}/> 
        </group>
    )  // Re-use instead of loading each time
}


function Cloud({height, position, size}) {
    const refToCloud = useRef();

    useEffect(() => {
        if(refToCloud.current) {
            refToCloud.current.position.set(position.x, height, position.y)
            refToCloud.current.scale.set(size);
        }
    })

    return (
        <mesh position={[0, 0, 0]} scale={[1,1,1]}>
            <mesh position={[130, 190, 100]} scale={[2,2,2]}>
                <sphereGeometry args={[5, 10, 6]}/>
                <meshStandardMaterial flatShading/>
            </mesh>

            <mesh position={[100, 190, 100]} scale={[2,2,2]}>
                <sphereGeometry args={[5, 10, 6]}/>
                <meshStandardMaterial flatShading/>
            </mesh>
            <mesh position={[115, 190, 100]} scale={[3,3,3]}>
                <sphereGeometry args={[5, 10, 6]}/>
                <meshStandardMaterial flatShading/>
            </mesh>
        </mesh>
    )
}


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
            e.stopPropagation(); // Stops event from reaching further objects
            setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        >
            <cylinderGeometry args={[radius, radius, height, 6, 1]}/>
            <meshStandardMaterial color={hovered ? "red" : colour} flatShading receiveShadow/> 
        </mesh>
    )
}


function GenerateMap({gridRadius, hexRadius, maxHeight, heightVariance}) {
    const hexagons = [];
    const trees = [];
    const paletteDark = {
        "grass": "#d4ccb4",
        "stone": "#74707c",
        "dirt": "#202436"

        //"default" : "#d5d8de",
        //"dirt" : "#1a0a09",
        //"grass" : "#62806a"
    };
    const paletteNatural = {
        "grass": "#414833",
        "grass2": "#4a523a",
        "lowgrass" : "#656D4A",
        "dirt": "#7F4F24",
        "lowdirt": "#582F0E",
        "variance": "#0E86CC"
    }
    const possibleModels = ["Oak", "Spruce", "Birch", "Tree_Stump"];


    // DEBUG UI
    const {dirtHeight, ldirtHeight, lGrassHeight, mountainHeight, 
           dirtColour, ldirtColour, lgrassColour, grassColour, grass2Colour, waterColour } = useControls({
    dirtHeight : {
        value: 1.5,
        min: 0,
        max: 20,
        step: 0.25
    },
    ldirtHeight : {
        value: 2.5,
        min: 0,
        max: 20,
        step: 0.25
    }, 
    lGrassHeight : {
        value: 7.5,
        min: 0,
        max: 20,
        step: 0.25
    },
    mountainHeight : {
        value: 49,
        min: 0,
        max: 100,
        step: 0.25
    },
    dirtColour: '#582F0E', 
    ldirtColour: '#7F4F24',
    lgrassColour: '#656D4A',
    grassColour: "#414833",
    grass2Colour: "#728071",
    waterColour: "#0E86CC"
});
// --------------------------
    

    // Noise Consts
    const DIRT_HEIGHT = maxHeight * dirtHeight;
    const LOWDIRT_HEIGHT = maxHeight * ldirtHeight;
    const LOWGRASS_HEIGHT = maxHeight * lGrassHeight;

    // Scale up to make water dominate dirt, scale down to do the opposite
    const WATER_HEIGHT = maxHeight * 2; 
    const GRASS_HEIGHT = maxHeight * mountainHeight;

    const FREQUENCY = 0.1;
    // https://www.npmjs.com/package/simplex-noise -> look into this for creating unique seed for each sub and storing it in database MAYBE????????
    const noise2D = createNoise2D();

    // Generates pointy top - axial hexagonal grid
    // https://www.redblobgames.com/grids/hexagons/ THANK YOU RED BLOB GAMES
    for (let q = -gridRadius; q <= gridRadius; q++) {
        for (let r = -gridRadius; r < gridRadius; r++) {
            // Noise
            let height = (noise2D(r * FREQUENCY, q * FREQUENCY) + 1) * 0.5;
            height = Math.pow(height, 1.5) * heightVariance;
            height = height * maxHeight;

            let variance = (noise2D(r * FREQUENCY, q * FREQUENCY) + 1) * 0.5;
            variance = Math.pow(height, 1.5) * heightVariance;
            variance = height * maxHeight;

            if (Math.abs(q + r) > gridRadius) continue; // constraint q + r + s = 0
            const x = hexRadius * Math.sqrt(3) * (q + r/2);
            const y = hexRadius * 3/2 * r;
            
            // < = bottom up generation, > = top down generation
            let colour = grassColour;
            let isWater = false;
            if(height < DIRT_HEIGHT) {
                if(variance < WATER_HEIGHT) {
                    colour = waterColour;
                    isWater = true;
                } else {    
                    colour = dirtColour;
                } 
            } else if(height < LOWDIRT_HEIGHT) {
                colour = ldirtColour;
            } else if(height < LOWGRASS_HEIGHT) {
                colour = lgrassColour;
            } else if(variance > GRASS_HEIGHT) {
                colour = grass2Colour;
            }

            hexagons.push({ x, y, height, hexRadius, colour});

            const random = Math.floor(Math.random() * possibleModels.length);
            const model = possibleModels[random];
            if(Math.random() > 0.965 && !(isWater)) {
                trees.push({x, y, height, model})
                console.log(model);
            }
        }
    }

    return (
        <mesh>
        {hexagons.map((pos, index) => (
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
            model={pos.model}/>
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
                files="assets/envmap.hdr" // Environment auto handles loading of envMap using RGBELoader: https://drei.docs.pmnd.rs/staging/environment
                /> 

                <GenerateMap gridRadius={35} hexRadius={5} maxHeight={5} heightVariance={15} castShadow/>

                <Cloud/>

                <OrbitControls target={[centerX, 10, centerY + 5]}/>
            </Canvas>
        </div>
    )
}