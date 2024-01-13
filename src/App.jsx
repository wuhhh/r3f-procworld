import { useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, shaderMaterial, useTexture } from "@react-three/drei";
import { BackSide, Color, DoubleSide, Vector3 } from "three";
import { Leva, useControls } from "leva";

import { Model } from "./components/Paperplane";
import Story from "./components/Story";

import worldVertexShader from "./shaders/world/vert.glsl";
import worldFragmentShader from "./shaders/world/frag.glsl";

const WorldMaterial = shaderMaterial(
  {
		uCapsuleColourFar: null,
		uCapsuleColourNear: null,
		uDepth: .0,
		uParam1: .0,
		uParam2: .0,
		uParam3: .0,
		uParam4: .0,
		uParam5: .0,
		uParam6: .0,
		uParam7: .0,
		uParam8: .0,
		uScapeMix: .0,
		uRadius: .0,
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
  const radialSegments = 96;
  const tubularSegments = 96;

	const worldConf = useControls("world", {
		uCapsuleColourFar: '#ff2233',
		uCapsuleColourNear: '#002233',
		scapeMix: {
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.01,
		},
		uParam1: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam2: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam3: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam4: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam5: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam6: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam7: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
		uParam8: {
			value: 0.0,
			min: -32.0,
			max: 32.0,
			step: .1,
		},
	});

  const vertices_ = [];
	const normals_ = [];
	const levels_ = [];
  const uvs_ = [];
  const indices_ = [];

	/**
	 * Generate a segment of vertices
	 * @param {Number} i - index
	 * @param {Number} r - radius
	 * @param {Number} l - level
	 */
  const generateSegment = (i, r, l) => {
    for (let j = 0; j < radialSegments; j++) {
      const u = j / (radialSegments - 1);
      const theta = u * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      const z = (i / (tubularSegments - 1) - 0.5) * depth;
      vertices_.push(x, y, z);
			levels_.push(...l);
			const normal = new Vector3(x, y, 0.0).normalize();
			normals_.push(normal.x, normal.y, normal.z);
    }
  };

  const generateUVs = () => {
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        let u = j / (radialSegments - 1);
				// u = Math.abs(u * 2.0 - 1.0); // x uv from 0 to 1 to 0
				uvs_.push(u, 1.0 - i / (tubularSegments - 1));
      }
    }
  };

	const generateIndices = (offset = 0) => {
		for (let i = 0; i < tubularSegments - 1; i++) {
			for (let j = 0; j < radialSegments; j++) {
				const a = offset + i * radialSegments + j;
				const b = offset + i * radialSegments + ((j + 1) % radialSegments);
				const c = offset + (i + 1) * radialSegments + ((j + 1) % radialSegments);
				const d = offset + (i + 1) * radialSegments + j;
	
				// console.log(a, b, c, d);
	
				indices_.push(a, b, c);
				indices_.push(a, c, d);
			}
		}
	}

	/** 
	 * FIRST PASS
	 */

	// Generate vertices
  for (let i = 0; i < tubularSegments; i++) {
    generateSegment(i, radius, [1, 0, 0]);
  }

	// Generate the last row of vertices
  // generateSegment(tubularSegments, radius, [1, 0, 0]);

	// Generate UVs
	generateUVs();

	// Generate indices
  generateIndices(0);

	/**
	 * SECOND PASS
	 */

	// Generate vertices
  for (let i = 0; i < tubularSegments; i++) {
    generateSegment(i, radius * .9, [0, 1, 0]);
  }

	// Generate the last row of vertices
  // generateSegment(tubularSegments * 2, radius * .5, [0, 1, 0]);

	// Generate UVs
	generateUVs();

  // Generate indices
  generateIndices(radialSegments * tubularSegments);

  const vertices = new Float32Array(vertices_);
	const normals = new Float32Array(normals_);
	const levels = new Float32Array(levels_);
  const uvs = new Float32Array(uvs_);
  const indices = new Uint16Array(indices_);

	useFrame((_, delta) => {
		worldMaterial.current.uniforms.uTime.value += delta;
		capsule.current.rotation.z = Math.PI * .5 + Math.sin(_.clock.elapsedTime * 0.001) * Math.PI;
	});

  return (
    <>
      <mesh ref={capsule} position={[0, 1, 0]}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={vertices.length / 3} array={vertices} itemSize={3} />
					<bufferAttribute attach='attributes-normal' count={normals.length / 3} array={normals} itemSize={3} />
					<bufferAttribute attach='attributes-level' count={levels.length / 3} array={levels} itemSize={3} />
          <bufferAttribute attach='attributes-uv' count={uvs.length / 2} array={uvs} itemSize={2} />
          <bufferAttribute attach='index' count={indices.length} array={indices} itemSize={1} />
        </bufferGeometry>
        <worldMaterial 
					ref={worldMaterial} 
					side={BackSide} 
					transparent
					uCapsuleColourFar={new Color(worldConf.uCapsuleColourFar)}
					uCapsuleColourNear={new Color(worldConf.uCapsuleColourNear)}
					uDepth={depth} 
					uParam1={worldConf.uParam1}
					uParam2={worldConf.uParam2}
					uParam3={worldConf.uParam3}
					uParam4={worldConf.uParam4}
					uParam5={worldConf.uParam5}
					uParam6={worldConf.uParam6}
					uParam7={worldConf.uParam7}
					uParam8={worldConf.uParam8}
					uScapeMix={worldConf.scapeMix} 
					uRadius={radius}
					// wireframe 
				/>
      </mesh>
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
		t.current.rotation.x = Math.cos(time * .3) * Math.sin(time * .8) * Math.PI * .2;
		t.current.position.y += t.current.rotation.x * .003;

		// roll (left/right)
		t.current.rotation.z = Math.cos(time * .2) * Math.sin(time * .8) * Math.PI * .1;
		t.current.position.x -= t.current.rotation.z * .003;

		// yaw (turn left/right)
		t.current.rotation.y = t.current.rotation.z;

		// fwd/bwd 
		t.current.position.z += t.current.rotation.x * 0.005;
	});

	return (
		<Model ref={t} scale={[0.08, 0.08, 0.08]} position={[0.5, -.2, 1]}>
			<meshMatcapMaterial matcap={matcap} side={DoubleSide} />
		</Model>
	);
};

const Beyond = (props) => {
	const matcap = useTexture("/textures/matcap-tech.png");

	return <mesh scale={[60, 60, 60]} position={[-3, 300, -1000]}>
		<sphereGeometry />
		<meshMatcapMaterial matcap={matcap} opacity={.1} transparent />
	</mesh>
}

const App = () => {
  return (
		<>
			<Canvas>
				{/* <Leva hidden /> */}
				<Float>
					<PerspectiveCamera makeDefault fov={90} position={[0, 0, 3.9]} />
				</Float>
				<OrbitControls />
				<Capsule />
				<Beyond />
				<Traveller />
			</Canvas>
			<Story />
		</>
  );
};

export default App;
