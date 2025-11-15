import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei';
//import { useControls } from 'leva';
import {createNoise2D} from 'simplex-noise';
import { useState, useEffect } from "react";
import * as THREE from "three";
import Tree from "./Tree.js";
import Cloud from "./Cloud.js";
import Tile from "./Tile.js"

// ----------
// MAJOR TODO: Merge meshes where possible to avoid performance issues.
// See: comment on RenderMap
// ----------


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
function generateTiles({gridRadius, hexRadius, maxHeight, heightVariance}) {
    const tiles = [];

    const palette = {
        "dirt": '#582F0E', 
        "ldirt": '#7F4F24',
        "lgrass": '#656D4A',
        "grass": "#414833",
        "mountain": "#728071",
        "water": "#0E86CC"    
    }

    // Noise Consts
    const waterHeight = maxHeight * 0.5; 
    const dirtHeight = maxHeight * 1.5;
    const lowDirtHeight = maxHeight * 2.5;
    const lowGrassHeight = maxHeight * 5;
    const grassHeight = maxHeight * 9.5;

    const FREQUENCY = 0.1;
    const FREQUENCY2 = 0.05
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

            
            let variance = (noise2D(r * FREQUENCY2, q * FREQUENCY2) + 1) * 0.5;
            variance = Math.pow(variance, 1.5) * heightVariance;
            variance = variance * maxHeight;

            tileHeight = (tileHeight * 0.98) * (variance * 0.03)
            
            if (Math.abs(q + r) > gridRadius) continue; // constraint q + r + s = 0
            const x = hexRadius * Math.sqrt(3) * (q + r/2);
            const y = hexRadius * 3/2 * r;
            
            /** 
             * This creates a colouring scheme where each tile type has its own height interval (sort of like a layered cake)
             * the block checks the tile's height starting from the lowest interval and moves up an interval each time.
             * Once it finds the correct interval, it sets the tile's type to the interval's type.
             * If no appropriate interval is found in time then it reaches/defaults to 'mountain', the highest interval.
             * */ 
            let tileColour = palette["mountain"]; // Defines tileType and sets the default tile type, voiding need of 'else' (two birds one stone)
            let tileType = "mountain"
            if (tileHeight < waterHeight) {
                tileType = "water"
                tileColour = palette["water"];
            }
            else if(tileHeight < dirtHeight) {
                tileType = "dirt" 
                tileColour = palette[tileType];
            } else if(tileHeight < lowDirtHeight) {
                tileType = "ldirt"
                tileColour = palette[tileType];
            } else if(tileHeight < lowGrassHeight) {
                tileType = "lgrass"
                tileColour = palette[tileType];
            } else if(tileHeight < grassHeight) {
                tileType = "grass"
                tileColour = palette[tileType];
            }

            tiles.push({x, y, height: tileHeight, hexRadius, colour: tileColour, type: tileType});
        }
    }
    return tiles;
}


function generateTrees({tiles}) {
    const TreeModels = ["Oak", "Tree_Stump"];
    const trees = [];
    const TREE_FREQUENCY = 0.965

    for(let i = 0; i < tiles.length; i++) {
        let current_tile = tiles[i];
        let isWater = false;

        const random = Math.floor(Math.random() * TreeModels.length);
        const chosenTreeModel = TreeModels[random];

        if (current_tile.type === "water") {
            isWater = true;
        }

        // Determines if a tree is placed on current tile
        if(Math.random() > TREE_FREQUENCY && !(isWater)) {
            trees.push({x: current_tile.x , y: current_tile.y, height: current_tile.height, chosenTreeModel})
        }
    }
    return trees;
}


/* I figured out how to use Instances to reduce the 3500 draw calls (INSANITY) but I don't like how it takes
* away customization and it feels janky/weird.
* I'll think about it more but I don't like sacrifing my Tile component.
*/
function RenderMap({tiles, trees}) {
    return (
        <mesh>
        {tiles.map((pos, index) => (
            <Tile 
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


/* Test render function for River Generation
* - Pick two random points on the edge of the grid (we can find this by drawing ring maybe?)
* - Use linear interpolatino for getting array of tiles making up a line of hexes from one point
*   to the other
* - Render these tiles as water tiles
*
* - CONSIDER how to variate width of river
**/
function tilesToBeModified({tiles, type}) {
    return tiles.map(tile => {
        if(tile.type == type) {
            return {
                ...tile, // Spread operator: copies all other tile attributes, only changes colour
                height: 0,
                colour: "#0E86CC"
            };
            
        }
        return tile; // Else return the tile without its colour being changed
    })
}


export default function World() {
    const [titleText, setTitleText] = useState('');
    const [tiles, setTiles] = useState([]);
    const [trees, setTrees] = useState([]);


    
    // TEMPORARY - MOVE TO SEPARATE FUNCTION LATER
    useEffect(() => {
        fetch('/message')
            .then((res) => res.json())
            .then((data) => {
            setTitleText(data.title);
        });
    }, []); // Empty dependency array to run once on mount

    // ** Generation Funtions that are used to create the objects then rendered by the render components**
    useEffect(() => {
        const tiles = generateTiles({ gridRadius: 35, hexRadius: 6, maxHeight: 5, heightVariance: 15 });
        const trees = generateTrees({tiles: tiles})

        const modified = tilesToBeModified({tiles: tiles, type: "ldirt"})

        setTiles(tiles)
        setTrees(trees)
    }, [])

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

                <OrbitControls target={[centerX, 10, centerY + 5]}/>
                
                <RenderMap tiles={tiles} trees={trees}/>

                
            </Canvas>
        </div>
    )
}