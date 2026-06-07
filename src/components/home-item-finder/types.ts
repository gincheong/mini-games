export interface Point {
	x: number;
	y: number;
}

export interface Item {
	id: string;
	drawerId: string;
	name: string;
	memo: string;
	tags: string[];
}

export interface Drawer {
	id: string;
	furnitureId: string;
	label: string;
	order: number;
	items: Item[];
}

export type FurnitureType = 'dresser' | 'wardrobe' | 'shelf' | 'custom';

export interface Furniture {
	id: string;
	roomId: string;
	label: string;
	type: FurnitureType;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	drawers: Drawer[];
}

export interface Room {
	id: string;
	name: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	color: string;
}
