import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, shaderMaterial, useTexture } from "@react-three/drei";
import { BackSide, Color, DoubleSide, Euler, MathUtils, Quaternion, Vector3 } from "three";
import { Leva, useControls } from "leva";

import LogoMark from "./components/LogoMark";
import { Model } from "./components/Spaceship";
import Story from "./components/Story";

import worldVertexShader from "./shaders/world/vert.glsl";
import worldFragmentShader from "./shaders/world/frag.glsl";
import planetBodyVertexShader from "./shaders/planetBody/vert.glsl";
import planetBodyFragmentShader from "./shaders/planetBody/frag.glsl";
// import spaceCanvasVertexShader from "./shaders/spaceCanvas/vert.glsl";
import spaceCanvasFragmentShader from "./shaders/spaceCanvas/frag.glsl";

const disableMotion = false;
const tQ = new Quaternion();

const WorldMaterial = shaderMaterial(
  {
    uCapsuleColourFar: null,
    uCapsuleColourNear: null,
    uDepth: 0.0,
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

	/**
	 * Generate UVs
	 */
  const generateUVs = () => {
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        let u = j / (radialSegments - 1);
        // u = Math.abs(u * 2.0 - 1.0); // x uv from 0 to 1 to 0
        uvs_.push(u, 1.0 - i / (tubularSegments - 1));
      }
    }
  };

	/**
	 * Generate indices
	 */
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

	// Generate the capsule [the hard way :D]
	const { vertices, normals, levels, uvs, indices } = useMemo(() => {
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

		return { vertices, normals, levels, uvs, indices };

	}, [radialSegments, tubularSegments]);

  useFrame((_, delta) => {
    worldMaterial.current.uniforms.uTime.value += delta * (disableMotion ? 0 : 1);
    capsule.current.rotation.z = Math.PI * 0.5 + Math.sin(_.clock.elapsedTime * 0.001) * Math.PI * (disableMotion ? 0 : 0.1);
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
          uRadius={radius}
          // wireframe
        />
      </mesh>
    </>
  );
};

const Traveller = () => {
  const t = useRef();
  const keysDown = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    window.addEventListener("keydown", e => {
      // Keyboard WASD and arrow keys using key codes
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        keysDown.current.s = true;
      }
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        keysDown.current.w = true;
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        keysDown.current.a = true;
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        keysDown.current.d = true;
      }
    });

    window.addEventListener("keyup", e => {
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        keysDown.current.s = false;
      }
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        keysDown.current.w = false;
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        keysDown.current.a = false;
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        keysDown.current.d = false;
      }
    });
  }, []);

  const [pitchInertia, setPitchInertia] = useState(0);
  const [rollInertia, setRollInertia] = useState(0);
  const [yawInertia, setYawInertia] = useState(0);

  useFrame((state, delta) => {
    // Clamp delta
    delta = Math.min(delta, 0.1);

		console.log(delta);

    // Loop through keysDown and update position with inertia
    if (keysDown.current.w) {
      setPitchInertia(pitchInertia <= -50 ? -50 : pitchInertia - delta * 10);
    }

    if (keysDown.current.s) {
      setPitchInertia(pitchInertia >= 50 ? 50 : pitchInertia + delta * 10);
    }

    if (keysDown.current.a) {
      setRollInertia(rollInertia >= 35 ? 35 : rollInertia + delta * 100);
      setYawInertia(yawInertia >= 35 ? 35 : yawInertia + delta * 100);
    }

    if (keysDown.current.d) {
      setRollInertia(rollInertia <= -35 ? -35 : rollInertia - delta * 100);
      setYawInertia(yawInertia <= -35 ? -35 : yawInertia - delta * 100);
    }

    // Self-righting
    if (!keysDown.current.w && !keysDown.current.s) {
      setPitchInertia(MathUtils.lerp(pitchInertia, 0, delta * 1.1));
      t.current.rotation.x = MathUtils.lerp(t.current.rotation.x, 0, delta * 1.1);
    }

    if (!keysDown.current.a && !keysDown.current.d) {
      setRollInertia(MathUtils.lerp(rollInertia, 0, delta * 1.1));
      setYawInertia(MathUtils.lerp(yawInertia, 0, delta * 1.1));
      t.current.rotation.z = MathUtils.lerp(t.current.rotation.z, 0, delta * 1.1);
      t.current.rotation.y = MathUtils.lerp(t.current.rotation.y, 0, delta * 1.1);
    }

    // Update rotation
    tQ.setFromEuler(new Euler(pitchInertia * delta * 0.25, yawInertia * delta * 0.005, rollInertia * delta * 0.025, "XYZ"));
		t.current.quaternion.multiplyQuaternions(tQ, t.current.quaternion);	
    // t.current.rotation.x += pitchInertia * delta * 0.1;
    // t.current.rotation.z += rollInertia * delta * 0.01;
    // t.current.rotation.y += yawInertia * delta * 0.005;

    // Update position
    t.current.position.y += t.current.rotation.x * delta * 2.4;
    t.current.position.x -= t.current.rotation.z * delta * 1.5;

    // Move forwards and backwards automatically
    // t.current.position.z += Math.sin(state.clock.elapsedTime * 0.5) * delta * .1;

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
  });

  return (
    <Model ref={t} scale={[0.05, 0.05, 0.05]} position={[0.5, -0.2, 2]} />
  );
};

const Beyond = props => {
  const planetBody = useRef();
  const spaceCanvas = useRef();

  const conf = useControls("beyond", {
    spaceCanvasColour: "#ffbcbc",
    spaceCanvasColour1: "#ffc2c2",
    spaceCanvasColour2: "#00416f",
    spaceCanvasColour3: "#90e010",
  });

  useFrame((state, delta) => {
    planetBody.current.material.uniforms.uTime.value += delta;
    spaceCanvas.current.material.uniforms.uTime.value += delta;
  });

  const SpaceCanvasMaterial = shaderMaterial(
    {
      uColor: new Color(conf.spaceCanvasColour),
      uColor1: new Color(conf.spaceCanvasColour1),
      uColor2: new Color(conf.spaceCanvasColour2),
      uColor3: new Color(conf.spaceCanvasColour3),
      uTime: Math.random() * 999,
    },
    `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
    spaceCanvasFragmentShader
  );

  const spaceCanvasMaterial = new SpaceCanvasMaterial();

  return (
    <>
      <mesh ref={spaceCanvas} scale={[18, 20, 1]} position={[0, 1, -13]} material={spaceCanvasMaterial}>
        <planeGeometry args={[1, 1]} />
      </mesh>
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
        <Leva hidden />
        <Float speed={disableMotion ? 0 : 2}>
          <PerspectiveCamera makeDefault fov={90} position={[0, 0, 3.9]} />
        </Float>
        <OrbitControls />
        <Capsule />
        <Beyond />
        <Traveller />
      </Canvas>
      <LogoMark />
      {/* <Story /> */}
    </>
  );
};

export default App;
