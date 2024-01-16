/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { MeshBasicMaterial } from 'three';
import { forwardRef } from "react";
import { useGLTF, useTexture } from '@react-three/drei'

export const Model = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('/spaceship-d3-transformed.glb')
	const bakedTexture = useTexture('/textures/spaceship-baked-sunlight.png')
	// const bakedTexture = useTexture('/textures/spaceship-baked.png')
	bakedTexture.flipY = false
	const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh geometry={nodes.body.geometry} material={bakedMaterial} position={[0, -0.03, 0]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={nodes.bodyPop.geometry} material={bakedMaterial} />
        <mesh geometry={nodes.boost.geometry} material={bakedMaterial} position={[0, 0, -2.6]} rotation={[Math.PI / 2, 0, 0]} scale={0.5}>
          {/* <mesh geometry={nodes.boostEmission.geometry} material={nodes.boostEmission.material} position={[0, -1.37, 0]} scale={[0.56, 0.77, 0.56]} /> */}
          <mesh geometry={nodes.boostGlow.geometry} material={materials.light} position={[0, 0.05, 0]} />
        </mesh>
        <mesh geometry={nodes.cockpit.geometry} material={bakedMaterial} />
        <mesh geometry={nodes.lights.geometry} material={materials.light} />
        <mesh geometry={nodes.undersidePopArrow.geometry} material={bakedMaterial} />
        <mesh geometry={nodes.undersidePopRects.geometry} material={bakedMaterial} />
        <mesh geometry={nodes.wingJoints.geometry} material={bakedMaterial}>
          <mesh geometry={nodes.wingPop.geometry} material={bakedMaterial} />
          <mesh geometry={nodes.wings.geometry} material={bakedMaterial}>
            <mesh geometry={nodes.wingLights.geometry} material={materials.light} position={[0, 0.01, 0]} />
          </mesh>
        </mesh>
      </mesh>
    </group>
  )
});

useTexture.preload('/textures/spaceship-baked-sunlight.png')
// useTexture.preload('/textures/spaceship-baked.png')
useGLTF.preload('/spaceship-d3-transformed.glb')

export default Model;