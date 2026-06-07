import { createFileRoute } from '@tanstack/react-router';
import SharkGame from '@/components/shark-game/Game';

export const Route = createFileRoute('/shark-game')({
	component: SharkGamePage,
});

function SharkGamePage() {
	return (
		<div
			style={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<SharkGame />
		</div>
	);
}
