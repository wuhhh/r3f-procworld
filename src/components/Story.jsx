import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useStore from "../stores/useStore";

export default function Story() {
  const hideStory = useStore(state => state.hideStory);

  const config = {
    lineDelay: 30, // in seconds
    charDelayMin: 0.05, // in seconds
    charDelayMax: 1, // in seconds
    story: [
      <>Where are we?</>,
      <>Is that a mirage?</>,
      <>I've been flying for so long.</>,
      <>Something monumental must have happened...</>,
      <>It's been hours since we lost contact</>,
      <>Do you think that could be Earth?</>,
      <>Do you remember the smell of the ocean?</>,
      <>Time feels different here...</>,
      <>What were the skies like when you were young?</>,
      <>When did you last feel the sun on your skin?</>,
    ],
  };

  const time = useRef(performance.now() / 1000); // in ms
  const prevTime = useRef(time.current / 1000); // in ms
  const delta = useRef(0);
  const charIndex = useRef(0);
  const storyIndex_ = useRef();

  const lineTimer = useRef(0);
  const charTimer = useRef(0);
  const lineElement = useRef(null);
  const [storyIndex, setStoryIndex] = useState(null);

  const [story, setStory] = useState(config.story);

  const cursor = document.createElement("span");
  cursor.className = "ignore animate-blink";
  cursor.innerHTML = "&#9612;";

  /**
   * Wrap characters in spans
   */
  const wrapCharacters = () => {
    let temp = [];
    for (let i = 0; i < story.length; i++) {
      let line = story[i];
      let wrappedLine = [];
      for (let j = 0; j < line.props.children.length; j++) {
        let char = line.props.children[j];
        wrappedLine.push(<span key={j}>{char}</span>);
      }
      temp.push(<>{wrappedLine}</>);
    }
    setStory(temp);
  };

  const storyEl = useRef(null);

  // Initial setup
  useEffect(() => {
    wrapCharacters();
    setStoryIndex(Math.floor(Math.random() * story.length));
    storyIndex_.current = storyIndex;
    render();
  }, []);

  // Set current line element
  useLayoutEffect(() => {
    lineTimer.current = 0; // Reset line timer
    charIndex.current = 0; // Reset char index

    if (storyEl.current) {
      lineElement.current = storyEl.current.querySelector(".is-current-line");
    }

    if (lineElement.current) {
      // match all except .ignore
      const span = lineElement.current.querySelectorAll("span:not(.ignore)");
      // const span = lineElement.current.querySelectorAll("span");
      span.forEach(el => {
        el.style.visibility = "hidden";
      });
    }
  }, [storyIndex]);

  /**
   * Render loop
   */
  const render = () => {
    let charDelay = Math.random() * (config.charDelayMax - config.charDelayMin) + config.charDelayMin;

    // Calculate time and delta
    time.current = performance.now() / 1000;
    delta.current = time.current - prevTime.current;
    prevTime.current = time.current;

    // Update current line
    if (lineTimer.current > config.lineDelay) {
      storyIndex_.current = (storyIndex_.current + 1) % story.length;
      setStoryIndex(storyIndex_.current);
    }

    // Typewriter effect by toggling visibility of spans
    if (charTimer.current >= charDelay && lineElement.current) {
      charTimer.current = 0; // Reset char timer

      const span = lineElement.current.querySelectorAll("span:not(.ignore)");

      if (charIndex.current < span.length) {
        // span[charIndex.current].classList.remove("bg-almost-white/80");

        span[charIndex.current].style.visibility = "visible";
        charIndex.current++;
      }

      if (charIndex.current + 1 <= span.length) {
        span[charIndex.current].appendChild(cursor);
        span[charIndex.current].style.visibility = "visible";
      }
    }

    // Update timers
    lineTimer.current += delta.current;
    charTimer.current += delta.current;

    // Render
    requestAnimationFrame(render);
  };

  return (
    <div className={`transition-opacity duration-500 ease-in-out ${hideStory ? "opacity-0" : "opacity-100"}`}>
      <div className='absolute inset-0 flex items-end justify-center text-center pointer-events-none'>
        <div ref={storyEl} className='story-line'>
          {story.map((line, i) => (
            <div key={i} className={storyIndex === i ? "block is-current-line" : "hidden"}>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
