export interface StarItem {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	emoji: string;
	size: number;
}

export type GameState = 'IDLE' | 'PLAYING' | 'FINISHED';
