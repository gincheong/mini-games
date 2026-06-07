import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
	Drawer,
	Furniture,
	FurnitureType,
	Item,
	Room,
} from '#/components/home-item-finder/types';

const ROOM_COLORS = [
	'rgba(30, 58, 95, 0.35)',
	'rgba(45, 30, 95, 0.35)',
	'rgba(30, 95, 58, 0.35)',
	'rgba(95, 58, 30, 0.35)',
	'rgba(58, 95, 30, 0.35)',
	'rgba(95, 30, 58, 0.35)',
];

const FURNITURE_DEFAULTS: Record<
	FurnitureType,
	{ label: string; width: number; height: number }
> = {
	dresser: { label: '서랍장', width: 100, height: 60 },
	wardrobe: { label: '옷장', width: 120, height: 70 },
	shelf: { label: '선반', width: 130, height: 40 },
	custom: { label: '가구', width: 100, height: 80 },
};

const uid = () => Math.random().toString(36).slice(2, 10);

interface SearchResult {
	item: Item;
	drawer: Drawer;
	furniture: Furniture;
	room: Room;
}

interface HomeStore {
	rooms: Room[];
	furniture: Furniture[];
	selectedRoomId: string | null;
	selectedFurnitureId: string | null;
	detailFurnitureId: string | null;
	searchQuery: string;

	addRoom: (x: number, y: number, width: number, height: number) => void;
	updateRoom: (
		id: string,
		updates: Partial<Omit<Room, 'id' | 'color'>>,
	) => void;
	deleteRoom: (id: string) => void;
	selectRoom: (id: string | null) => void;

	addFurniture: (type: FurnitureType) => void;
	updateFurniture: (
		id: string,
		updates: Partial<Omit<Furniture, 'drawers'>>,
	) => void;
	deleteFurniture: (id: string) => void;
	selectFurniture: (id: string | null) => void;
	openDetail: (id: string | null) => void;

	addDrawer: (furnitureId: string) => void;
	updateDrawer: (furnitureId: string, drawerId: string, label: string) => void;
	deleteDrawer: (furnitureId: string, drawerId: string) => void;
	reorderDrawers: (furnitureId: string, drawers: Drawer[]) => void;

	addItem: (furnitureId: string, drawerId: string, name: string) => void;
	updateItem: (
		furnitureId: string,
		drawerId: string,
		itemId: string,
		updates: Partial<Item>,
	) => void;
	deleteItem: (furnitureId: string, drawerId: string, itemId: string) => void;

	setSearchQuery: (q: string) => void;
	getSearchResults: () => SearchResult[];

	exportData: () => void;
	importData: (data: unknown) => void;
	clearData: () => void;
}

export const useHomeStore = create<HomeStore>()(
	persist(
		(set, get) => ({
			rooms: [],
			furniture: [],
			selectedRoomId: null,
			selectedFurnitureId: null,
			detailFurnitureId: null,
			searchQuery: '',

			addRoom: (x, y, width, height) => {
				const { rooms } = get();
				const id = uid();
				const color = ROOM_COLORS[rooms.length % ROOM_COLORS.length];
				set((s) => ({
					rooms: [
						...s.rooms,
						{
							id,
							name: `방 ${s.rooms.length + 1}`,
							x,
							y,
							width,
							height,
							rotation: 0,
							color,
						},
					],
					selectedRoomId: id,
				}));
			},

			updateRoom: (id, updates) => {
				set((s) => ({
					rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
				}));
			},

			deleteRoom: (id) => {
				set((s) => ({
					rooms: s.rooms.filter((r) => r.id !== id),
					furniture: s.furniture.filter((f) => f.roomId !== id),
					selectedRoomId: s.selectedRoomId === id ? null : s.selectedRoomId,
				}));
			},

			selectRoom: (id) =>
				set({ selectedRoomId: id, selectedFurnitureId: null }),

			addFurniture: (type) => {
				const { selectedRoomId, rooms } = get();
				if (!selectedRoomId) return;

				const room = rooms.find((r) => r.id === selectedRoomId);
				if (!room) return;

				const defaults = FURNITURE_DEFAULTS[type];
				const id = uid();
				const cx = room.x + room.width / 2;
				const cy = room.y + room.height / 2;

				const newFurniture: Furniture = {
					id,
					roomId: selectedRoomId,
					label: defaults.label,
					type,
					x: cx - defaults.width / 2,
					y: cy - defaults.height / 2,
					width: defaults.width,
					height: defaults.height,
					rotation: 0,
					drawers: [],
				};

				set((s) => ({
					furniture: [...s.furniture, newFurniture],
					selectedFurnitureId: id,
				}));
			},

			updateFurniture: (id, updates) => {
				set((s) => ({
					furniture: s.furniture.map((f) =>
						f.id === id ? { ...f, ...updates } : f,
					),
				}));
			},

			deleteFurniture: (id) => {
				set((s) => ({
					furniture: s.furniture.filter((f) => f.id !== id),
					selectedFurnitureId:
						s.selectedFurnitureId === id ? null : s.selectedFurnitureId,
					detailFurnitureId:
						s.detailFurnitureId === id ? null : s.detailFurnitureId,
				}));
			},

			selectFurniture: (id) => set({ selectedFurnitureId: id }),

			openDetail: (id) => set({ detailFurnitureId: id }),

			addDrawer: (furnitureId) => {
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						const newDrawer: Drawer = {
							id: uid(),
							furnitureId,
							label: `${f.drawers.length + 1}단 서랍`,
							order: f.drawers.length,
							items: [],
						};
						return { ...f, drawers: [...f.drawers, newDrawer] };
					}),
				}));
			},

			updateDrawer: (furnitureId, drawerId, label) => {
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						return {
							...f,
							drawers: f.drawers.map((d) =>
								d.id === drawerId ? { ...d, label } : d,
							),
						};
					}),
				}));
			},

			deleteDrawer: (furnitureId, drawerId) => {
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						return {
							...f,
							drawers: f.drawers.filter((d) => d.id !== drawerId),
						};
					}),
				}));
			},

			reorderDrawers: (furnitureId, drawers) => {
				set((s) => ({
					furniture: s.furniture.map((f) =>
						f.id === furnitureId ? { ...f, drawers } : f,
					),
				}));
			},

			addItem: (furnitureId, drawerId, name) => {
				const newItem: Item = {
					id: uid(),
					drawerId,
					name,
					memo: '',
					tags: [],
				};
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						return {
							...f,
							drawers: f.drawers.map((d) => {
								if (d.id !== drawerId) return d;
								return { ...d, items: [...d.items, newItem] };
							}),
						};
					}),
				}));
			},

			updateItem: (furnitureId, drawerId, itemId, updates) => {
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						return {
							...f,
							drawers: f.drawers.map((d) => {
								if (d.id !== drawerId) return d;
								return {
									...d,
									items: d.items.map((i) =>
										i.id === itemId ? { ...i, ...updates } : i,
									),
								};
							}),
						};
					}),
				}));
			},

			deleteItem: (furnitureId, drawerId, itemId) => {
				set((s) => ({
					furniture: s.furniture.map((f) => {
						if (f.id !== furnitureId) return f;
						return {
							...f,
							drawers: f.drawers.map((d) => {
								if (d.id !== drawerId) return d;
								return { ...d, items: d.items.filter((i) => i.id !== itemId) };
							}),
						};
					}),
				}));
			},

			setSearchQuery: (q) => set({ searchQuery: q }),

			getSearchResults: () => {
				const { searchQuery, rooms, furniture } = get();
				const q = searchQuery.toLowerCase().trim();
				if (!q) return [];

				const results: SearchResult[] = [];
				for (const f of furniture) {
					const room = rooms.find((r) => r.id === f.roomId);
					if (!room) continue;
					for (const d of f.drawers) {
						for (const item of d.items) {
							const matches =
								item.name.toLowerCase().includes(q) ||
								item.memo.toLowerCase().includes(q) ||
								item.tags.some((t) => t.toLowerCase().includes(q));
							if (matches) {
								results.push({ item, drawer: d, furniture: f, room });
							}
						}
					}
				}
				return results;
			},

			exportData: () => {
				const { rooms, furniture } = get();
				const data = JSON.stringify({ rooms, furniture }, null, 2);
				const blob = new Blob([data], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'home-finder-data.json';
				a.click();
				URL.revokeObjectURL(url);
			},

			importData: (data) => {
				try {
					const parsed = data as { rooms: Room[]; furniture: Furniture[] };
					if (parsed.rooms && parsed.furniture) {
						set({ rooms: parsed.rooms, furniture: parsed.furniture });
					}
				} catch {
					// ignore invalid data
				}
			},

			clearData: () =>
				set({
					rooms: [],
					furniture: [],
					selectedRoomId: null,
					selectedFurnitureId: null,
					detailFurnitureId: null,
				}),
		}),
		{ name: 'home-finder-data' },
	),
);
