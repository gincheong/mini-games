import { createFileRoute } from '@tanstack/react-router';
import {
	Anchor,
	Footer,
	GameCard,
	GameDesc,
	GameGrid,
	GameIcon,
	GameInfo,
	GameName,
	Header,
	Main,
	Subtitle,
	Title,
} from '#/components/index/styled';

export const Route = createFileRoute('/')({ component: Home });

const GAMES = [
	{
		to: '/7-seconds' as const,
		icon: '⏱️',
		name: '7초 맞히기',
		desc: '마음속으로 N초를 세어보세요',
		accent: '#60a5fa',
	},
	{
		to: '/shark-game' as const,
		icon: '🦈',
		name: '상어 게임',
		desc: '손동작으로 상어를 피하세요',
		accent: '#00aaff',
	},
	{
		to: '/space-game' as const,
		icon: '🚀',
		name: '우주선 게임',
		desc: '손동작으로 별을 모아보세요',
		accent: '#9b5de5',
	},
] as const;

function Home() {
	return (
		<Main>
			<Header>
				<Title>mini-games</Title>
				<Subtitle>소소한 미니게임 모음</Subtitle>
			</Header>

			<GameGrid>
				{GAMES.map((game) => (
					<GameCard key={game.to} to={game.to} $accent={game.accent}>
						<GameIcon>{game.icon}</GameIcon>
						<GameInfo>
							<GameName>{game.name}</GameName>
							<GameDesc>{game.desc}</GameDesc>
						</GameInfo>
					</GameCard>
				))}
			</GameGrid>

			<Footer>
				<Anchor href="mailto:gincheong2@gmail.com">gincheong2@gmail.com</Anchor>
				<Anchor href="https://gincheong.github.io" target="_blank">
					Blog
				</Anchor>
				<Anchor
					href="https://github.com/gincheong"
					target="_blank"
					rel="noopener noreferrer"
				>
					Github
				</Anchor>
				<Anchor
					href="https://www.linkedin.com/in/gincheong2"
					target="_blank"
					rel="noopener noreferrer"
				>
					LinkedIn
				</Anchor>
			</Footer>
		</Main>
	);
}
