import { useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, shaderMaterial, useTexture } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";

import { Model } from "./components/Paperplane";

import worldVertexShader from "./shaders/world/vert.glsl";
import worldFragmentShader from "./shaders/world/frag.glsl";

const WorldMaterial = shaderMaterial(
  {
		uDepth: 1.0,
		uRadius: 1.0,
		uTime: Math.random() * 999,
	},
  worldVertexShader,
	worldFragmentShader
);

extend({ WorldMaterial });

const Capsule = () => {
	const capsule = useRef();
	const worldMaterial = useRef();
  const radius = 2.0;
  const depth = 7;
  const radialSegments = 256;
  const tubularSegments = 128;

  const vertices_ = [];
	const normals_ = [];
  const uvs_ = [];
  const indices_ = [];

  const generateSegment = i => {
    for (let j = 0; j < radialSegments; j++) {
      const u = j / radialSegments;
      const theta = u * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      const z = (i / tubularSegments - 0.5) * depth;
      vertices_.push(x, y, z);
			const normal = new Vector3(x, y, 0.0).normalize();
			normals_.push(normal.x, normal.y, normal.z);
    }
  };

  const generateUVs = () => {
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const u = j / radialSegments;
				uvs_.push(u, 1.0 - i / tubularSegments);
      }
    }
  };

	// Generate vertices
  for (let i = 0; i < tubularSegments; i++) {
    generateSegment(i);
  }

	// Generate the last row of vertices
  generateSegment(tubularSegments);

	// Generate indices
  for (let i = 0; i < tubularSegments - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * radialSegments + j;
      const b = i * radialSegments + ((j + 1) % radialSegments);
      const c = (i + 1) * radialSegments + ((j + 1) % radialSegments);
      const d = (i + 1) * radialSegments + j;
      indices_.push(a, b, c);
      indices_.push(a, c, d);
    }
  }

	// Generate UVs
	generateUVs();

  const vertices = new Float32Array(vertices_);
	const normals = new Float32Array(normals_);
  const uvs = new Float32Array(uvs_);
  const indices = new Uint16Array(indices_);

	useFrame((_, delta) => {
		worldMaterial.current.uniforms.uTime.value += delta;
		// capsule.current.rotation.z = Math.sin(_.clock.elapsedTime * 0.001) * Math.PI;
	});

  return (
    <>
      <mesh ref={capsule} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={vertices.length / 3} array={vertices} itemSize={3} />
					<bufferAttribute attach='attributes-normal' count={normals.length / 3} array={normals} itemSize={3} />
          <bufferAttribute attach='attributes-uv' count={uvs.length / 2} array={uvs} itemSize={2} />
          <bufferAttribute attach='index' count={indices.length} array={indices} itemSize={1} />
        </bufferGeometry>
        <worldMaterial ref={worldMaterial} side={DoubleSide} uDepth={depth} uRadius={radius} />
      </mesh>
      <ambientLight />
    </>
  );
};

const Traveller = () => {
	const t = useRef();
	const matcap = useTexture("/textures/matcap-hot.png");

	useFrame((state, delta) => {
		const { x, y } = state.pointer;
		const time = state.clock.elapsedTime;

		// pitch (up/down)
		t.current.rotation.x = Math.sin(time * .8) * Math.PI * .2;
		t.current.position.y += t.current.rotation.x * .003;

		// roll (left/right)
		t.current.rotation.z = Math.sin(time * .8) * Math.PI * .1;
		t.current.position.x -= t.current.rotation.z * .003;

		// yaw (turn left/right)
		t.current.rotation.y = t.current.rotation.z;

		// fwd/bwd 
		t.current.position.z += t.current.rotation.x * 0.005;
	});

	return (
		<Model ref={t} scale={[0.05, 0.05, 0.05]} position={[0.5, -.2, 1]}>
			<meshMatcapMaterial matcap={matcap} side={DoubleSide} />
		</Model>
	);
};

const App = () => {
  return (
    <Canvas>
			<Float>
				<PerspectiveCamera makeDefault fov={70} position={[0, 0, 7]} />
			</Float>
      <OrbitControls />
      <Capsule />
			<Traveller />
    </Canvas>
  );
};

export default App;
