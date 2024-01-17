/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { Color, DoubleSide, MeshBasicMaterial } from "three";
import { forwardRef } from "react";
import { shaderMaterial, useGLTF, useTexture } from "@react-three/drei";
import { folder, useControls } from "leva";

import boostEmissionVertexShader from "../shaders/boostEmission/vert.glsl";
import boostEmissionFragmentShader from "../shaders/boostEmission/frag.glsl";
import { useFrame } from '@react-three/fiber';

export const Model = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF("/spaceship-d3-transformed.glb");
  const bakedTexture = useTexture("/textures/spaceship-baked.png");
  const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });
  const useBaked = true;

  bakedTexture.flipY = false;

  const materialConfig = useControls("materials", {
    body: folder({
      bodyColor: "#132a6f",
    }),
    bodyPop: folder({
      bodyPopColor: "#862121",
    }),
    cockpit: folder({
      cockpitColor: "#de9e9e",
    }),
  });

  const bodyMaterial = new MeshBasicMaterial({ color: materialConfig.bodyColor });
  const bodyPopMaterial = new MeshBasicMaterial({ color: materialConfig.bodyPopColor });
  const cockpitMaterial = new MeshBasicMaterial({ color: materialConfig.cockpitColor });

  const BoostEmissionMaterial = shaderMaterial(
		{
			uColor: new Color(0xFF7D78),
			uTime: 0,
		},
		boostEmissionVertexShader, 
		boostEmissionFragmentShader
	);

	const boostEmissionMaterial = new BoostEmissionMaterial({
		transparent: true,
		side: DoubleSide,
	});
		
	useFrame(({ clock }) => {
		boostEmissionMaterial.uniforms.uTime.value = clock.getElapsedTime();
	});

  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        geometry={nodes.body.geometry}
        material={useBaked ? bakedMaterial : bodyMaterial}
        position={[0, -0.03, 0]}
        rotation={[0, Math.PI, 0]}
      >
        <mesh geometry={nodes.bodyPop.geometry} material={useBaked ? bakedMaterial : bodyPopMaterial} />
        <mesh
          geometry={nodes.boost.geometry}
          material={useBaked ? bakedMaterial : bodyPopMaterial}
          position={[0, 0, -2.6]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.5}
        >
          <mesh
            geometry={nodes.boostEmission.geometry}
            material={boostEmissionMaterial}
            position={[0, -1.37, 0]}
            scale={[0.56, 8, 0.56]}
          />
          <mesh geometry={nodes.boostGlow.geometry} material={materials.light} position={[0, 0.05, 0]} />
        </mesh>
        <mesh geometry={nodes.cockpit.geometry} material={useBaked ? bakedMaterial : cockpitMaterial} />
        <mesh geometry={nodes.lights.geometry} material={materials.light} />
        <mesh geometry={nodes.undersidePopArrow.geometry} material={useBaked ? bakedMaterial : bodyPopMaterial} />
        <mesh geometry={nodes.undersidePopRects.geometry} material={useBaked ? bakedMaterial : bodyPopMaterial} />
        <mesh geometry={nodes.wingJoints.geometry} material={useBaked ? bakedMaterial : bodyMaterial}>
          <mesh geometry={nodes.wingPop.geometry} material={useBaked ? bakedMaterial : bodyPopMaterial} />
          <mesh geometry={nodes.wings.geometry} material={useBaked ? bakedMaterial : bodyMaterial}>
            <mesh geometry={nodes.wingLights.geometry} material={materials.light} position={[0, 0.01, 0]} />
          </mesh>
        </mesh>
      </mesh>
    </group>
  );
});

useTexture.preload("/textures/spaceship-baked-sunlight.png");
// useTexture.preload('/textures/spaceship-baked.png')
useGLTF.preload("/spaceship-d3-transformed.glb");

export default Model;
