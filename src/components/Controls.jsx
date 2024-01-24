import { useEffect, useRef, useState } from "react";
import useStore from "../stores/useStore";

export default function Controls(props) {
  const joy = useRef();
  const joyStart = useRef({ x: 0, y: 0 });
  const joyCurrent = useRef({ x: 0, y: 0 });
  const touchIsDown_ = useRef(false);
  const touchIsDown = useStore(state => state.touchIsDown);
  const setTouchIsDown = useStore(state => state.setTouchIsDown);
  const mouseIsDown_ = useRef(false);
  const mouseIsDown = useStore(state => state.mouseIsDown);
  const setMouseIsDown = useStore(state => state.setMouseIsDown);
  const [log, setLog] = useState("Some log...");
  const setKeyDown = useStore(state => state.setKeyDown);
  const setPitchInertia = useStore(state => state.setPitchInertia);
  const setRollInertia = useStore(state => state.setRollInertia);

  // Keyboard controls
  useEffect(() => {
    window.addEventListener("keydown", e => {
      // Keyboard WASD and arrow keys using key codes
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        setKeyDown("w", true);
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setKeyDown("a", true);
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        setKeyDown("s", true);
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        setKeyDown("d", true);
      }
    });

    window.addEventListener("keyup", e => {
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        setKeyDown("w", false);
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setKeyDown("a", false);
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        setKeyDown("s", false);
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        setKeyDown("d", false);
      }
    });
  }, []);

  const handleStart = e => {
    // e.preventDefault();
    setLog(e.type);

    if (e.type === "mousedown") {
      mouseIsDown_.current = true;
      setMouseIsDown(true);
    } else {
      touchIsDown_.current = true;
      setTouchIsDown(true);
    }

    let x, y;

    if (e.type === "touchstart") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    joyStart.current = { x, y };
  };

  const handleEnd = e => {
    // e.preventDefault();

    if (e.type === "mouseup") {
      mouseIsDown_.current = false;
      setMouseIsDown(false);
    } else {
      touchIsDown_.current = false;
      setTouchIsDown(false);
    }
  };

  const handleCancel = e => {
    // e.preventDefault();
  };

  const handleMove = e => {
    // e.preventDefault();
    setLog(e.type);

    let x, y;

    if (e.type === "touchmove") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    joyCurrent.current = { x, y };

    let dx = joyCurrent.current.x - joyStart.current.x;
    let dy = joyCurrent.current.y - joyStart.current.y;

    dx = dx / 10;
    dy = dy / 100;

    if ((e.type === "mousemove" && mouseIsDown_.current) || e.type === "touchmove") {
      setPitchInertia(dy);
      setRollInertia(-dx);
      setLog(`e.type: ${e.type}, dx: ${dx}, dy: ${dy}`);
    }
  };

  // Touch controls
  useEffect(() => {
    window.addEventListener("touchstart", handleStart);
    window.addEventListener("mousedown", handleStart);
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchcancel", handleCancel);
    window.addEventListener("mouseleave", handleCancel);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mousemove", handleMove);
  }, []);

  return (
    <div ref={joy} className='!hidden absolute inset-0 flex items-end justify-center pb-24 pointer-events-auto'>
      <div className='relative w-16 aspect-square rounded-full border border-white/50'>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            mouseIsDown || touchIsDown ? "bg-white" : "bg-white/50"
          } w-8 aspect-square rounded-full`}
        ></div>
      </div>
      {(mouseIsDown || touchIsDown) && (
        <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs'>
          Drag to control : <span>{log}</span>
        </div>
      )}
    </div>
  );
}
