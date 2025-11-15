import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from "react";

export default function Tree({height, position, model}) {
    const MODELS = {
        "Oak" : 'assets/tree.glb',
        //"Spruce" : 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-lime/model.gltf',
        //"Birch" : 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf',
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
            if(model === "Oak" || model === "Fall_Tree") {
                refToTree.current.scale.set(20, 20, 20);
            }
            if(model === "Tree_Stump") {
                refToTree.current.scale.set(50, 50, 50);
            }
        }
      }, [position, height]);

    return (
        <group castShadow>
        <primitive ref={refToTree} object={scene.clone()}/> 
        </group>
    )  // Re-use instead of loading each time
}