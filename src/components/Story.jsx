import { useEffect, useRef, useState } from "react";

export default function Story() {
	const out = useRef();
	const _line = useRef('');
	const [line, setLine] = useState(_line.current);

	const story = [
		"I've been flying for so long",
		"I don't know where I am",
		"Or where I'm going",
		"Why am I here?",
		"<em>Where</em> is here?",
	];

	const typewriter = (text, i = 0) => {
		if (i < text.length) {
			const char = text.charAt(i);

			if (char === '<') {
				const end = text.indexOf('>', i);
				_line.current += text.substring(i, end + 1);
				i = end;
			}
			else {
				_line.current += char;
				setLine(_line.current);
			}

			setTimeout(() => typewriter(text, i + 1), 80);
		}
	}

	const progressStory = () => {
		if (story.length > 1) {
			story.shift();
			_line.current = "";
			setLine(_line.current);
			typewriter(story[0]);
		}
	}

	useEffect(() => {
		typewriter(story[0]);

		setInterval(() => {
			progressStory();
		}, 10000);
	}, []);

	return (
		<div className='absolute inset-0 flex items-end justify-center text-center'>
			<div className='flex gap-x-1 font-mono text-white pb-16 opacity-70 leading-normal'>
				<span ref={out} dangerouslySetInnerHTML={{ __html: line }}></span>
				<span className='animate-blink'>&#x2588;</span>
			</div>
		</div>
	);
}