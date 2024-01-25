import { useEffect, useRef, useState } from "react";
import useStore from "../stores/useStore";
import IconTick from "./svg/IconTick";
import IconWASD from "./svg/IconWASD";
import IconKbdArrows from "./svg/IconKbdArrows";

export default function Settings(props) {
  const [showSettings, setShowSettings] = useState(false);
  const invertY = useStore(state => state.invertY);
  const toggleInvertY = useStore(state => state.toggleInvertY);
  const toggleSettingsRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target) &&
        toggleSettingsRef.current &&
        !toggleSettingsRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='absolute inset-0 pointer-events-auto'>
      <div
        ref={settingsRef}
        className={`${showSettings ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} transition-opacity duration-300`}
      >
        <div className='absolute w-full max-w-[347px] pt-8 px-8 pb-12 bg-spaceship-black/65 backdrop-blur-lg border border-cloud-pink text-cloud-pink mx-8 lg:mx-0 bottom-[75px] lg:right-[26px]'>
          <h2 className='text-lg font-bold pb-4 border-b border-b-cloud-pink border-dashed mb-4'>Settings</h2>
          <div className='mb-3'>
            <label htmlFor='invert' className='cursor-pointer flex items-center gap-x-2'>
              <div className='w-[18px] aspect-square relative'>
                <input
                  type='checkbox'
                  name='invert'
                  id='invert'
                  checked={invertY}
                  onChange={toggleInvertY}
                  className='absolute w-full h-full opacity-0 peer'
                />
                <IconTick className='opacity-0 transition peer-checked:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                <div className='w-[18px] aspect-square rounded-sm border border-cloud-pink'></div>
              </div>
              Invert
            </label>
          </div>
          <div>
            <label htmlFor='mute' className='cursor-pointer flex items-center gap-x-2'>
              <div className='w-[18px] aspect-square relative'>
                <input type='checkbox' name='mute' id='mute' className='absolute w-full h-full opacity-0 peer' />
                <IconTick className='opacity-0 transition peer-checked:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                <div className='w-[18px] aspect-square rounded-sm border border-cloud-pink'></div>
              </div>
              Mute
            </label>
          </div>
          <div className='h-10'></div>
          <h2 className='text-lg font-bold pb-4 border-b border-b-cloud-pink border-dashed mb-4'>Keyboard Controls</h2>
          <div className='flex gap-x-[30px]'>
            <IconWASD />
            <IconKbdArrows />
          </div>
          <div className='h-10'></div>
          <h2 className='text-lg font-bold pb-4 border-b border-b-cloud-pink border-dashed mb-4'>Mouse/Touch Controls</h2>
          <p className='leading-6'>Click/touch anywhere on the screen and drag.</p>
        </div>
      </div>
      <button
        ref={toggleSettingsRef}
        onClick={() => setShowSettings(!showSettings)}
        className='absolute bottom-[26px] right-[26px] flex items-center justify-center gap-x-[3px] w-[26px] aspect-square'
        aria-label='Toggle Settings'
      >
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
      </button>
    </div>
  );
}
