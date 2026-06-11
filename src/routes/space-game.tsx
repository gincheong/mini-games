import { createFileRoute } from '@tanstack/react-router';
import { SpaceGame } from '#/components/space-game/SpaceGame';

export const Route = createFileRoute('/space-game')({
	component: SpaceGamePage,
	head: () => ({
		meta: [{ title: 'Space Game' }],
	}),
});

function SpaceGamePage() {
	return (
		<div
			style={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<SpaceGame />
		</div>
	);
}
