import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Story() {
  const config = {
    lineDelay: 25, // in seconds
    charDelay: 0.05, // in seconds
    story: [
      <>Where are we?</>,
      <>We must be inside some kind of nebula</>,
      <>I've been flying for so long.</>,
      <>Where are we? Something must have happened...</>,
      <>It feels like so long since comms died</>,
      <>Do you think that could be Earth?</>,
      <>Do you remember the smell of the ocean?</>,
      <>Time feels different here...</>,
      <>The French have a saying, "chasser des chimères"</>,
      <>What were the clouds like when you were young?</>,
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
    setTimeout(() => {
      render();
    }, 1000 * 5);
  }, []);

  // Set current line element
  useLayoutEffect(() => {
    lineTimer.current = 0; // Reset line timer
    charIndex.current = 0; // Reset char index

    if (storyEl.current) {
      lineElement.current = storyEl.current.querySelector(".is-current-line");
    }

    if (lineElement.current) {
      const span = lineElement.current.querySelectorAll("span");
      span.forEach(el => {
        el.style.visibility = "hidden";
      });
    }
  }, [storyIndex]);

  /**
   * Render loop
   */
  const render = () => {
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
    if (charTimer.current >= config.charDelay && lineElement.current) {
      charTimer.current = 0; // Reset char timer

      const span = lineElement.current.querySelectorAll("span");

      if (charIndex.current < span.length) {
        span[charIndex.current].style.visibility = "visible";
        charIndex.current++;
      }
    }

    // Update timers
    lineTimer.current += delta.current;
    charTimer.current += delta.current;

    // Render
    requestAnimationFrame(render);
  };

  return (
    <div className='absolute inset-0 flex items-end justify-center text-center pointer-events-none'>
      <div ref={storyEl} className='story-line'>
        {story.map((line, i) => (
          <div key={i} className={storyIndex === i ? "block is-current-line" : "hidden"}>
            <span>{line}</span>
            <span className='animate-blink'>&#9612;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
