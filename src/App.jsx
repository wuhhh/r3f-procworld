import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, shaderMaterial, useTexture } from "@react-three/drei";
import { AmbientLight, BackSide, Color, DoubleSide, MathUtils, Vector3 } from "three";
import { Leva, useControls } from "leva";

import { Model } from "./components/Spaceship";
import Story from "./components/Story";

import worldVertexShader from "./shaders/world/vert.glsl";
import worldFragmentShader from "./shaders/world/frag.glsl";
import planetBodyVertexShader from "./shaders/planetBody/vert.glsl";
import planetBodyFragmentShader from "./shaders/planetBody/frag.glsl";

const WorldMaterial = shaderMaterial(
  {
    uCapsuleColourFar: null,
    uCapsuleColourNear: null,
    uDepth: 0.0,
    uParam1: 0.0,
    uParam2: 0.0,
    uParam3: 0.0,
    uParam4: 0.0,
    uParam5: 0.0,
    uParam6: 0.0,
    uParam7: 0.0,
    uParam8: 0.0,
    uScapeMix: 0.0,
    uRadius: 0.0,
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
    uCapsuleColourFar: "#ff4848",
    uCapsuleColourNear: "#00416f",
    scapeMix: {
      value: 0.0,
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
    uParam1: {
      value: 0.0,
      min: -1.0,
      max: 1.0,
      step: 0.1,
    },
    uParam2: {
      value: 0.0,
      min: -1.0,
      max: 1.0,
      step: 0.1,
    },
    uParam3: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
    },
    uParam4: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
    },
    uParam5: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
    },
    uParam6: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
    },
    uParam7: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
    },
    uParam8: {
      value: 0.0,
      min: -32.0,
      max: 32.0,
      step: 0.1,
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
  };

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
    generateSegment(i, radius * 0.9, [0, 1, 0]);
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
    capsule.current.rotation.z = Math.PI * 0.5 + Math.sin(_.clock.elapsedTime * 0.001) * Math.PI;
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
	const keysDown = useRef({ w: false, a: false, s: false, d: false });

	console.log();

  useEffect(() => {
    window.addEventListener("keydown", e => {
      // Keyboard WASD and arrow keys using key codes
      if(e.code === "KeyS" || e.code === "ArrowDown") {
				keysDown.current.s = true;
			}
			if(e.code === "KeyW" || e.code === "ArrowUp") {
				keysDown.current.w = true;
			}
			if(e.code === "KeyA" || e.code === "ArrowLeft") {
				keysDown.current.a = true;
			}
			if(e.code === "KeyD" || e.code === "ArrowRight") {
				keysDown.current.d = true;
			}
    });

		window.addEventListener("keyup", e => {
			if(e.code === "KeyS" || e.code === "ArrowDown") {
				keysDown.current.s = false;
			}
			if(e.code === "KeyW" || e.code === "ArrowUp") {
				keysDown.current.w = false;
			}
			if(e.code === "KeyA" || e.code === "ArrowLeft") {
				keysDown.current.a = false;
			}
			if(e.code === "KeyD" || e.code === "ArrowRight") {
				keysDown.current.d = false;
			}
		});
  }, []);

	const [pitchInertia, setPitchInertia] = useState(0);
	const [rollInertia, setRollInertia] = useState(0);
	const [yawInertia, setYawInertia] = useState(0);

  useFrame((state, delta) => {
		// Loop through keysDown and update position with inertia
		if (keysDown.current.w) {
			setPitchInertia(pitchInertia <= -50 ? -50 : pitchInertia - 0.1);
		}

		if (keysDown.current.s) {
			setPitchInertia(pitchInertia >= 50 ? 50 : pitchInertia + 0.1);
		}

		if (keysDown.current.a) {
			setRollInertia(rollInertia >= 35 ? 35 : rollInertia + 1);
			setYawInertia(yawInertia >= 35 ? 35 : yawInertia + 1);
		}

		if (keysDown.current.d) {
			setRollInertia(rollInertia <= -35 ? -35 : rollInertia - 1);
			setYawInertia(yawInertia <= -35 ? -35 : yawInertia - 1);
		}
	
		// Self-righting
		if(!keysDown.current.w && !keysDown.current.s) {
			setPitchInertia(MathUtils.lerp(pitchInertia, 0, delta * 1.1));
			t.current.rotation.x = MathUtils.lerp(t.current.rotation.x, 0, delta * 1.1);
		}

		if(!keysDown.current.a && !keysDown.current.d) {
			setRollInertia(MathUtils.lerp(rollInertia, 0, delta * 1.1));
			setYawInertia(MathUtils.lerp(yawInertia, 0, delta * 1.1));
			t.current.rotation.z = MathUtils.lerp(t.current.rotation.z, 0, delta * 1.1);
			t.current.rotation.y = MathUtils.lerp(t.current.rotation.y, 0, delta * 1.1);
		}

		// Update rotation
		t.current.rotation.x += pitchInertia * delta * .1;
		t.current.rotation.z += rollInertia * delta * .01;
		t.current.rotation.y += yawInertia * delta * 0.005;
		
		// Update position
		t.current.position.y += t.current.rotation.x * delta * 2.4;
		t.current.position.x -= t.current.rotation.z * delta * 1.5;

		// Automatic flight
    // pitch (up/down)
    // t.current.rotation.x = Math.cos(time * .3) * Math.sin(time * .8) * Math.PI * .2;
    // t.current.position.y += t.current.rotation.x * delta_ * 1.2;

    // roll (left/right)
    // t.current.rotation.z = Math.cos(time * .2) * Math.sin(time * .8) * Math.PI * .1;
    // t.current.position.x -= t.current.rotation.z * delta_ * .96;

    // yaw (turn left/right)
    // t.current.rotation.y = t.current.rotation.z;

    // fwd/bwd
    // t.current.position.z += t.current.rotation.x * delta_ * 0.6;

		console.log(keysDown.current);
  });

  return (
    <Model ref={t} scale={[0.05, 0.05, 0.05]} position={[0.5, -0.2, 2]}>
      <meshMatcapMaterial matcap={matcap} side={DoubleSide} />
    </Model>
  );
};

const Beyond = props => {
  const planetBody = useRef();

  useFrame((state, delta) => {
    planetBody.current.material.uniforms.uTime.value += delta;
  });

  return (
    <>
      {/* <mesh scale={[18, 20, 1]} position={[0, 1, -13]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color='black' />
      </mesh> */}
      <mesh ref={planetBody} scale={[0.7, 0.7, 0.7]} position={[-2, 3, -10]}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          uniforms={{
            uTime: { value: Math.random() * 999 },
          }}
          vertexShader={planetBodyVertexShader}
          fragmentShader={planetBodyFragmentShader}
        />
      </mesh>
      {/* <mesh scale={[.7, .7, .7]} position={[-2, 3, -10]} rotation={[Math.PI * .66, -Math.PI * .2, 0]}>
			<ringGeometry args={[1.2, 1.6, 32]} />
			<meshBasicMaterial color="red" side={DoubleSide} />
		</mesh> */}
    </>
  );
};

const App = () => {
  return (
    <>
      <Canvas flat linear>
        {/* <Leva hidden /> */}
        <Float speed={2}>
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
