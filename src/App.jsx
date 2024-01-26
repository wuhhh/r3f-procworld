import { useEffect, useMemo, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, shaderMaterial } from "@react-three/drei";
import { BackSide, Color, Euler, MathUtils, PlaneGeometry, Quaternion, Vector3 } from "three";
import { Leva, useControls } from "leva";

import { Loader } from "./components/Loader";
import LogoMark from "./components/LogoMark";
import { Model } from "./components/Spaceship";
import Story from "./components/Story";

import useStore from "./stores/useStore";

import outsideVertexShader from "./shaders/outside/vert.glsl";
import outsideFragmentShader from "./shaders/outside/frag.glsl";
import planetBodyVertexShader from "./shaders/planetBody/vert.glsl";
import planetBodyFragmentShader from "./shaders/planetBody/frag.glsl";
import worldVertexShader from "./shaders/world/vert.glsl";
import worldFragmentShader from "./shaders/world/frag.glsl";
import Controls from "./components/Controls";
import Settings from "./components/Settings";

const disableMotion = false;
const tQ = new Quaternion();

const WorldMaterial = shaderMaterial(
  {
    uCapsuleColourFace: null,
    uCapsuleColourFar: null,
    uCapsuleColourNear: null,
    uOutsideColour: null,
    uDepth: 0.0,
    uRadius: 0.0,
    // uTime: 0.0,
    uTime: Math.random() * 999,
    uTravellerPos: new Vector3(0, 0, 0),
  },
  worldVertexShader,
  worldFragmentShader
);

extend({ WorldMaterial });

const Capsule = () => {
  const tPos = useStore(state => state.tPos);
  const capsule = useRef();
  const worldMaterial = useRef();
  const radius = 2.0;
  const depth = 7;
  const radialSegments = 96;
  const tubularSegments = 96;

  const worldConf = useControls("world", {
    uCapsuleColourFace: "#ffb6bf",
    uCapsuleColourFar: "#ff4848",
    uCapsuleColourNear: "#00416f",
    uOutsideColour: "#160b26",
  });

  const vertices_ = [];
  const normals_ = [];
  const levels_ = [];
  const uvs_ = [];
  const indices_ = [];
  const debrisOpacity_ = [];
  const debrisShape_ = [];
  const debrisColour_ = [];
  const debrisSpeed_ = [];

  const debrisAttrs = () => {
    return {
      opacity: Math.random(),
      shape: Math.floor(Math.random() * 4), // 0 - 3
      colour: Math.floor(Math.random() * 3), // 0 - 2
      speed: Math.random() * 4 + 1, // 1.0 - 5.0
    };
  };

  /**
   * Generate a segment of vertices
   * @param {Number} i - index
   * @param {Number} r - radius
   * @param {Number} l - level
   */
  const generateTubeSegment = (i, r, l) => {
    for (let j = 0; j < radialSegments; j++) {
      const u = j / (radialSegments - 1);
      const theta = u * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      const z = (i / (tubularSegments - 1) - 0.5) * depth;
      vertices_.push(x, y, z);
      levels_.push(...l);

      // Fill debris attributes with 0s
      debrisOpacity_.push(0);
      debrisShape_.push(0);
      debrisColour_.push(0);
      debrisSpeed_.push(0);

      const normal = new Vector3(x, y, 0.0).normalize().multiplyScalar(-1);
      normals_.push(normal.x, normal.y, normal.z);
    }
  };

  /**
   * Generate UVs
   */
  const generateTubeUVs = () => {
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        let u = j / (radialSegments - 1);
        uvs_.push(u, 1.0 - i / (tubularSegments - 1));
      }
    }
  };

  /**
   * Generate indices
   */
  const generateTubeIndices = (offset = 0) => {
    for (let i = 0; i < tubularSegments - 1; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = offset + i * radialSegments + j;
        const b = offset + i * radialSegments + ((j + 1) % radialSegments);
        const c = offset + (i + 1) * radialSegments + ((j + 1) % radialSegments);
        const d = offset + (i + 1) * radialSegments + j;

        // Original winding order
        // indices_.push(a, b, c);
        // indices_.push(a, c, d);

        // Reverse the order of vertices to invert the winding order
        // This changes the winding order from counter-clockwise to clockwise
        indices_.push(a, c, b); // Inverted triangle (across diagonal)
        indices_.push(a, d, c); // Original triangle (across diagonal)
      }
    }
  };

  /**
   * Generate plane [the easy way :D]
   */
  const generatePlane = (w, h, position = new Vector3()) => {
    const plane = new PlaneGeometry(w, h);
    const planeVertices = plane.attributes.position.array;
    const planeNormals = plane.attributes.normal.array;
    const planeUvs = plane.attributes.uv.array;

    // Transform planeVertices to position
    for (let i = 0; i < planeVertices.length; i += 3) {
      planeVertices[i] += position.x;
      planeVertices[i + 1] += position.y;
      planeVertices[i + 2] += position.z;
    }

    // Get debris attributes with random values
    const { opacity: dOpacity, shape: dShape, colour: dColour, speed: dSpeed } = debrisAttrs();

    // console.log('dOpacity', dOpacity);
    // console.log('dShape', dShape);
    // console.log('dColour', dColour);
    // console.log('dSpeed', dSpeed);

    // Fill levels and debris attributes
    const planeLevels = [];
    for (let i = 0; i < planeVertices.length; i++) {
      planeLevels.push(1, 0, 0);

      debrisOpacity_.push(dOpacity);
      debrisShape_.push(dShape);
      debrisColour_.push(dColour);
      debrisSpeed_.push(dSpeed);
    }

    // Generate plane indices from position array
    const planeIndices = [];
    const offset = vertices_.length / 3;

    planeIndices.push(offset + 2, offset + 1, offset + 0, offset + 2, offset + 3, offset + 1);

    vertices_.push(...planeVertices);
    normals_.push(...planeNormals);
    levels_.push(...planeLevels);
    uvs_.push(...planeUvs);
    indices_.push(...planeIndices);
  };

  // Generate the capsule [the hard way :D]
  const { vertices, normals, levels, uvs, indices, debrisOpacity, debrisShape, debrisColour, debrisSpeed } = useMemo(() => {
    /**
     * FIRST PASS : Outer layer / capsule terrain
     */

    // Generate vertices
    for (let i = 0; i < tubularSegments; i++) {
      generateTubeSegment(i, radius, [0, 0, 0]);
    }

    // Duplicate the first segment of vertices to create a flat top
    const firstSegment = vertices_.slice(0, radialSegments * 3);
    vertices_.push(...firstSegment);

    // Duplicate the first segment of normals to create a flat top
    const firstSegmentNormals = normals_.slice(0, radialSegments * 3);
    normals_.push(...firstSegmentNormals);

    for (let i = 0; i < firstSegment.length / 3; i++) {
      uvs_.push(1, 1);
      levels_.push(0, 0, 0);
      debrisOpacity_.push(0);
      debrisShape_.push(0);
      debrisColour_.push(0);
      debrisSpeed_.push(0);
    }

    // Generate UVs
    generateTubeUVs();

    // Generate indices
    generateTubeIndices(0);

    // Generate the top indices
    const topIndices = [];
    for (let i = 0; i < radialSegments - 2; i++) {
      topIndices.push(0);
      topIndices.push(i + 1);
      topIndices.push(i + 2);
    }
    indices_.push(...topIndices);

    /**
     * SECOND PASS : Cloud layer
     */

    // Generate vertices
    for (let i = 0; i < tubularSegments; i++) {
      generateTubeSegment(i, radius * 0.9, [0, 1, 0]);
    }

    // Generate UVs
    generateTubeUVs();

    // Generate indices
    generateTubeIndices(radialSegments * tubularSegments);

    /**
     * THIRD PASS : Debris layer
     */

    // Smol planes
    for (let i = 0; i < 20; i++) {
      generatePlane(0.1, 0.1, new Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * depth - depth * 0.5));
    }

    const vertices = new Float32Array(vertices_);
    const normals = new Float32Array(normals_);
    const levels = new Float32Array(levels_);
    const uvs = new Float32Array(uvs_);
    const indices = new Uint16Array(indices_);
    const debrisOpacity = new Float32Array(debrisOpacity_);
    const debrisShape = new Float32Array(debrisShape_);
    const debrisColour = new Float32Array(debrisColour_);
    const debrisSpeed = new Float32Array(debrisSpeed_);

    return { vertices, normals, levels, uvs, indices, debrisOpacity, debrisShape, debrisColour, debrisSpeed };
  }, [radialSegments, tubularSegments]);

  // console.log('vertices', vertices.length);
  // console.log('normals', normals.length);
  // console.log('levels', levels.length);
  // console.log('uvs', uvs.length);
  // console.log('indices', indices.length);
  // console.log('debrisOpacity', debrisOpacity.length);
  // console.log('debrisShape', debrisShape.length);
  // console.log('debrisColour', debrisColour.length);

  useFrame((_, delta) => {
    worldMaterial.current.uniforms.uTime.value += delta * (disableMotion ? 0 : 1);
    worldMaterial.current.uniforms.uTravellerPos.value = tPos;
    capsule.current.rotation.z = Math.PI * 0.5 + Math.sin(_.clock.elapsedTime * 0.001) * Math.PI * (disableMotion ? 0 : 0.1);
  });

  return (
    <>
      <mesh renderOrder={2} ref={capsule} position={[0, 1, 0]}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={vertices.length / 3} array={vertices} itemSize={3} />
          <bufferAttribute attach='attributes-normal' count={normals.length / 3} array={normals} itemSize={3} />
          <bufferAttribute attach='attributes-level' count={levels.length / 3} array={levels} itemSize={3} />
          <bufferAttribute attach='attributes-uv' count={uvs.length / 2} array={uvs} itemSize={2} />
          <bufferAttribute attach='attributes-debrisOpacity' count={debrisOpacity.length} array={debrisOpacity} itemSize={1} />
          <bufferAttribute attach='attributes-debrisShape' count={debrisShape.length} array={debrisShape} itemSize={1} />
          <bufferAttribute attach='attributes-debrisColour' count={debrisColour.length} array={debrisColour} itemSize={1} />
          <bufferAttribute attach='attributes-debrisSpeed' count={debrisSpeed.length} array={debrisSpeed} itemSize={1} />
          <bufferAttribute attach='index' count={indices.length} array={indices} itemSize={1} />
        </bufferGeometry>
        <worldMaterial
          ref={worldMaterial}
          transparent
          uCapsuleColourFace={new Color(worldConf.uCapsuleColourFace)}
          uCapsuleColourFar={new Color(worldConf.uCapsuleColourFar)}
          uCapsuleColourNear={new Color(worldConf.uCapsuleColourNear)}
          uOutsideColour={new Color(worldConf.uOutsideColour)}
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
  const invertY = useStore(state => state.invertY);
  const keysDown = useStore(state => state.keysDown);
  const touchIsDown = useStore(state => state.touchIsDown);
  const mouseIsDown = useStore(state => state.mouseIsDown);
  const pitchInertia = useStore(state => state.pitchInertia);
  const setPitchInertia = useStore(state => state.setPitchInertia);
  const rollInertia = useStore(state => state.rollInertia);
  const setRollInertia = useStore(state => state.setRollInertia);
  const yawInertia = useStore(state => state.yawInertia);
  const setYawInertia = useStore(state => state.setYawInertia);
  const tPos = useStore(state => state.tPos);
  const setTPos = useStore(state => state.setTPos);

  const boundsTop = 4;
  const boundsBottom = -2.5;
  const boundsLeft = -4;
  const boundsRight = 4;

  useFrame((_, delta) => {
    // Clamp delta
    delta = Math.min(delta, 0.1);

    // Loop through keysDown and update position with inertia

    // Up
    if ((keysDown.w && invertY) || (keysDown.s && !invertY)) {
      setPitchInertia(pitchInertia <= -50 ? -50 : pitchInertia - delta * 8);
    }

    // Down
    if ((keysDown.w && !invertY) || (keysDown.s && invertY)) {
      setPitchInertia(pitchInertia >= 50 ? 50 : pitchInertia + delta * 8);
    }

    // Left
    if (keysDown.a) {
      setRollInertia(rollInertia >= 35 ? 35 : rollInertia + delta * 80);
      setYawInertia(yawInertia >= 35 ? 35 : yawInertia + delta * 80);
    }

    // Right
    if (keysDown.d) {
      setRollInertia(rollInertia <= -35 ? -35 : rollInertia - delta * 80);
      setYawInertia(yawInertia <= -35 ? -35 : yawInertia - delta * 80);
    }

    // Self-righting
    if (!keysDown.w && !keysDown.s && !mouseIsDown && !touchIsDown) {
      setPitchInertia(MathUtils.lerp(pitchInertia, 0, delta * 1.1));
      t.current.rotation.x = MathUtils.lerp(t.current.rotation.x, 0, delta * 1.1);
    }

    if (!keysDown.a && !keysDown.d && !mouseIsDown && !touchIsDown) {
      setRollInertia(MathUtils.lerp(rollInertia, 0, delta * 1.1));
      setYawInertia(MathUtils.lerp(yawInertia, 0, delta * 1.1));
      t.current.rotation.z = MathUtils.lerp(t.current.rotation.z, 0, delta * 1.1);
      t.current.rotation.y = MathUtils.lerp(t.current.rotation.y, 0, delta * 1.1);
    }

    // Update rotation
    tQ.setFromEuler(new Euler(pitchInertia * delta * 0.25, yawInertia * delta * 0.005, rollInertia * delta * 0.025, "XYZ"));
    t.current.quaternion.multiplyQuaternions(tQ, t.current.quaternion);

    // Update position
    t.current.position.y += t.current.rotation.x * delta * 2.4;
    t.current.position.x -= t.current.rotation.z * delta * 1.5;

    // Test if traveller is outside the viewport and reset position
    if (t.current.position.y > boundsTop) {
      t.current.position.y = boundsTop;
    }

    if (t.current.position.y < boundsBottom) {
      t.current.position.y = boundsBottom;
    }

    if (t.current.position.x > boundsRight) {
      t.current.position.x = boundsRight;
    }

    if (t.current.position.x < boundsLeft) {
      t.current.position.x = boundsLeft;
    }

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

    // Update traveller position
    setTPos(tPos.setFromMatrixPosition(t.current.matrixWorld));
  });

  return <Model ref={t} scale={[0.05, 0.05, 0.05]} position={[0.5, -0.2, 2]} />;
};

const Beyond = props => {
  const outside = useRef();
  const planetBody = useRef();

  const OutsideMaterial = new shaderMaterial(
    {
      uBaseColour: null,
      uColor1: null,
      uColor2: null,
      uTime: Math.random() * 999,
    },
    outsideVertexShader,
    outsideFragmentShader
  );

  extend({ OutsideMaterial });

  useFrame((_, delta) => {
    outside.current.material.uniforms.uTime.value += delta;
    planetBody.current.material.uniforms.uTime.value += delta;
  });

  const outsideConf = useControls("outside", {
    sphereScale: 5,
    sphereBaseColour: "black",
    sphereColour1: "orange",
    sphereColour2: "cyan",
  });

  return (
    <>
      <mesh position={[0, 1, 0]} ref={outside} scale={[outsideConf.sphereScale, outsideConf.sphereScale, outsideConf.sphereScale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <outsideMaterial
          uBaseColour={new Color(outsideConf.sphereBaseColour)}
          uColor1={new Color(outsideConf.sphereColour1)}
          uColor2={new Color(outsideConf.sphereColour2)}
          side={BackSide}
          transparent
          // wireframe
        />
      </mesh>
      <mesh ref={planetBody} scale={[0.5, 0.5, 0.5]} position={[-0.8, 1.5, -3.499]}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          uniforms={{
            uTime: { value: Math.random() * 999 },
          }}
          vertexShader={planetBodyVertexShader}
          fragmentShader={planetBodyFragmentShader}
        />
      </mesh>
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
        <Capsule />
        <Beyond />
        <Traveller />
      </Canvas>
      <LogoMark />
      <Story />
      <Settings />
      <Controls />
      <Loader />
    </>
  );
};

export default App;
