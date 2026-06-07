import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/7-seconds')({ component: Home });

function Home() {
	return (
		<main>
			<h1>7초</h1>
			<p>
				Edit <code>src/routes/index.tsx</code> to get started.
			</p>
		</main>
	);
}
