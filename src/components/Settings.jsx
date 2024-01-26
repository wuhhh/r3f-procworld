import { useEffect, useRef, useState } from "react";
import useStore from "../stores/useStore";
import IconWASD from "./svg/IconWASD";
import IconKbdArrows from "./svg/IconKbdArrows";
import CheckboxSetting from "./CheckboxSetting";

export default function Settings(props) {
  const [showSettings, setShowSettings] = useState(false);
  const hideStory = useStore(state => state.hideStory);
  const toggleHideStory = useStore(state => state.toggleHideStory);
  const muted = useStore(state => state.muted);
  const toggleMuted = useStore(state => state.toggleMuted);
  const invertY = useStore(state => state.invertY);
  const toggleInvertY = useStore(state => state.toggleInvertY);
  const toggleSettingsRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        setShowSettings(false);
      }
    });

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
    <div className='absolute inset-0 pointer-events-auto mx-[26px]'>
      {/* Toggle settings */}
      <button
        ref={toggleSettingsRef}
        onClick={() => setShowSettings(!showSettings)}
        className='absolute bottom-[26px] right-0 flex items-center justify-center gap-x-[3px] w-[26px] aspect-square'
        aria-label='Toggle Settings'
        aria-controls='settings'
        aria-expanded={showSettings}
      >
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
        <span className='w-[6px] aspect-square rounded-full bg-cloud-pink'></span>
      </button>

      {/* Settings pane */}
      <div
        ref={settingsRef}
        id='settings'
        className={`settings ${
          showSettings ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        } transition-opacity duration-300`}
        aria-hidden={!showSettings}
      >
        <h2 className='settings__heading'>Settings</h2>
        <div className='mb-3'>
          <CheckboxSetting
            name='invert'
            id='invert'
            checked={invertY}
            tabIndex={!showSettings ? -1 : 0}
            onChange={toggleInvertY}
            label='Invert'
          />
        </div>
        {/* <div className='mb-3'>
          <CheckboxSetting
            name='mute'
            id='mute'
            checked={muted}
            tabIndex={!showSettings ? -1 : 0}
            onChange={toggleMuted}
            label='Mute audio'
          />
        </div> */}
        <div>
          <CheckboxSetting
            name='hide-story'
            id='hide-story'
            checked={hideStory}
            tabIndex={!showSettings ? -1 : 0}
            onChange={toggleHideStory}
            label='Hide story'
          />
        </div>
        <div className='h-10'></div>
        <h2 className='settings__heading'>Keyboard Controls</h2>
        <div className='flex gap-x-[30px]'>
          <IconWASD />
          <IconKbdArrows />
        </div>
        <div className='h-10'></div>
        <h2 className='settings__heading'>Mouse/Touch Controls</h2>
        <p className='leading-6'>Click/touch anywhere on the screen and drag.</p>
      </div>
    </div>
  );
}
