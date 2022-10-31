import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	Easing,
	Img,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import audioSource from './assets/music.mp3';
import coverImg from './assets/cover.jpeg';
import { LINE_HEIGHT, PaginatedSubtitles } from './Subtitles';
import { NoiseComp } from './Noise';

const AudioViz = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const audioData = useAudioData(audioSource);

	if (!audioData) {
		return null;
	}

	const allVisualizationValues = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples: 512, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const visualization = allVisualizationValues.slice(8, 32);

	const mirrored = [...visualization.slice(1).reverse(), ...visualization];

	return (
		<div className="audio-viz">
			{mirrored.map((v, i) => {
				return (
					<div
						key={i}
						className="bar"
						style={{
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

const subtitlesSource = staticFile('subtitles.srt');

export const AudiogramComposition = () => {
	const { durationInFrames } = useVideoConfig();

	const [handle] = useState(() => delayRender());
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch(subtitlesSource)
			.then((res) => res.text())
			.then((text) => {
				setSubtitles(text);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Error fetching subtitles', err);
			});
	}, [handle]);

	// Change this to adjust the part of the audio to use
	const offset = 5800;

	if (!subtitles) {
		0;
		return null;
	}

	return (
		<div ref={ref}>
			<AbsoluteFill>
				<Sequence from={-offset}>
					<Audio src={audioSource} />

					<div
						className="container"
						style={{
							fontFamily: 'Kalam',
						}}
					>
						<div
							style={{
								zIndex: 1,
								position: 'absolute',
							}}
						>
							<NoiseComp circleRadius={5} maxOffset={50} speed={0.01} />
						</div>
						<div className="row">
							<Img className="cover" src={coverImg} />

							<div className="title">Dhairya - Sajjan Raj Vaidya</div>
						</div>

						<div>
							<AudioViz />
						</div>

						<div
							style={{
								lineHeight: `${LINE_HEIGHT}px`,
							}}
							className="captions"
						>
							<PaginatedSubtitles
								src={subtitles}
								startFrame={offset}
								endFrame={offset + durationInFrames}
								linesPerPage={2}
								renderSubtitleItem={(item, frame) => (
									<>
										<span
											style={{
												backfaceVisibility: 'hidden',
												display: 'inline-block',

												opacity: interpolate(
													frame,
													[item.start, item.start + 15],
													[0, 1],
													{
														extrapolateLeft: 'clamp',
														extrapolateRight: 'clamp',
													}
												),
												transform: `perspective(1000px) translateY(${interpolate(
													frame,
													[item.start, item.start + 15],
													[0.5, 0],
													{
														easing: Easing.out(Easing.quad),
														extrapolateLeft: 'clamp',
														extrapolateRight: 'clamp',
													}
												)}em)`,
											}}
										>
											{item.text}
										</span>{' '}
									</>
								)}
							/>
						</div>
					</div>
				</Sequence>
			</AbsoluteFill>
		</div>
	);
};
