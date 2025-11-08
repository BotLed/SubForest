import { useRef, useEffect } from "react";

export default function Cloud({height, position, size}) {
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