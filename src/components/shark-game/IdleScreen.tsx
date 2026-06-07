import { Button, Input, Message } from './styled';

interface Props {
	isModelLoading: boolean;
	durationInput: string;
	onDurationChange: (value: string) => void;
	onDurationBlur: () => void;
	onStart: () => void;
}

export function IdleScreen({
	isModelLoading,
	durationInput,
	onDurationChange,
	onDurationBlur,
	onStart,
}: Props) {
	return (
		<Message>
			<h1>🦈 상어 먹이 사냥</h1>
			<p>웹캠을 이용해 손을 움직여 상어를 조종하세요!</p>
			<p>제한 시간 내에 최대한 많은 물고기를 잡으세요.</p>
			<div>
				<label
					htmlFor="game-duration"
					style={{ color: '#00aaff', fontSize: '1rem' }}
				>
					제한 시간 (초)
				</label>
				<br />
				<Input
					id="game-duration"
					type="number"
					min={5}
					max={300}
					value={durationInput}
					onChange={(e) => onDurationChange(e.target.value)}
					onBlur={onDurationBlur}
				/>
			</div>
			{isModelLoading ? (
				<p style={{ color: '#00aaff', fontWeight: 'bold' }}>
					🎮 게임 준비 중 (핸드 트래킹 모델 로딩)...
				</p>
			) : (
				<Button onClick={onStart}>게임 시작</Button>
			)}
		</Message>
	);
}
