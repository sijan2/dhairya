import { Composition } from 'remotion';
import { AudiogramComposition } from './Composition';
import './style.css';

const fps = 60;
const durationInFrames = 2360;

export const RemotionVideo: React.FC = () => {
	return (
		<Composition
			id="Audiogram"
			component={AudiogramComposition}
			durationInFrames={durationInFrames}
			fps={fps}
			width={1080}
			height={1920}
		/>
	);
};
