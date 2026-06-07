import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import {
	Group,
	Layer,
	Line,
	Rect,
	Stage,
	Text,
	Transformer,
} from 'react-konva';
import { useHomeStore } from '#/store/useHomeStore';
import type { Point } from './types';

const GRID_SIZE = 20;
const MIN_SIZE = 60;
const SCALE_BY = 1.08;
const SCALE_MIN = 0.1;
const SCALE_MAX = 5;

const FURNITURE_COLORS: Record<string, string> = {
	dresser: '#4a6fa5',
	wardrobe: '#6a4a8f',
	shelf: '#4a8f6a',
	custom: '#8f6a4a',
};
const FURNITURE_ICONS: Record<string, string> = {
	dresser: '🗄️',
	wardrobe: '🚪',
	shelf: '📚',
	custom: '📦',
};

function snap(v: number) {
	return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

interface ViewTransform {
	x: number;
	y: number;
	scale: number;
}

interface DrawRect {
	start: Point;
	current: Point;
}

interface CtxMenu {
	x: number;
	y: number;
	type: 'room' | 'furniture';
	id: string;
}

interface CanvasProps {
	width: number;
	height: number;
}

export default function Canvas({ width, height }: CanvasProps) {
	const {
		rooms,
		furniture,
		selectedRoomId,
		selectedFurnitureId,
		selectRoom,
		selectFurniture,
		addRoom,
		updateRoom,
		deleteRoom,
		updateFurniture,
		deleteFurniture,
		openDetail,
	} = useHomeStore();

	const [view, setView] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
	const [drawMode, setDrawMode] = useState(false);
	const [drawRect, setDrawRect] = useState<DrawRect | null>(null);
	const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
	const [grabbing, setGrabbing] = useState(false);

	const stageRef = useRef<Konva.Stage>(null);
	const isPanning = useRef(false);
	const justPanned = useRef(false);
	const drawModeRef = useRef(drawMode);
	const panOrigin = useRef<{
		mx: number;
		my: number;
		tx: number;
		ty: number;
	} | null>(null);

	const roomGroupRefs = useRef<Record<string, Konva.Group | null>>({});
	const furnitureGroupRefs = useRef<Record<string, Konva.Group | null>>({});
	const roomTrRef = useRef<Konva.Transformer>(null);
	const furnitureTrRef = useRef<Konva.Transformer>(null);

	// Screen → world coordinate conversion
	const toWorld = (screenPos: Point): Point => ({
		x: (screenPos.x - view.x) / view.scale,
		y: (screenPos.y - view.y) / view.scale,
	});

	// drawModeRef: ref용 동기화 (이벤트 리스너 stale closure 방지)
	useEffect(() => {
		drawModeRef.current = drawMode;
	}, [drawMode]);

	// Global mouse move/up for left-click pan on empty stage
	useEffect(() => {
		const PAN_THRESHOLD = 5;
		const onMove = (e: MouseEvent) => {
			if (!panOrigin.current || drawModeRef.current) return;
			const dx = e.clientX - panOrigin.current.mx;
			const dy = e.clientY - panOrigin.current.my;
			// Start panning only after threshold to distinguish from click
			if (!isPanning.current) {
				if (Math.sqrt(dx * dx + dy * dy) < PAN_THRESHOLD) return;
				isPanning.current = true;
				setGrabbing(true);
			}
			setView((v) => ({
				...v,
				x: panOrigin.current!.tx + dx,
				y: panOrigin.current!.ty + dy,
			}));
		};
		const onUp = (e: MouseEvent) => {
			if (e.button !== 0) return;
			if (isPanning.current) justPanned.current = true;
			isPanning.current = false;
			panOrigin.current = null;
			setGrabbing(false);
		};
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, []);

	// Draw mode trigger from sidebar
	useEffect(() => {
		const handler = () => {
			setDrawMode(true);
			setDrawRect(null);
		};
		window.addEventListener('canvas:startDrawing', handler);
		return () => window.removeEventListener('canvas:startDrawing', handler);
	}, []);

	// Room Transformer
	// biome-ignore lint/correctness/useExhaustiveDependencies: rooms dep ensures ref freshness
	useEffect(() => {
		if (!roomTrRef.current) return;
		const show = selectedRoomId && !selectedFurnitureId;
		const node = show ? roomGroupRefs.current[selectedRoomId] : null;
		roomTrRef.current.nodes(node ? [node] : []);
		roomTrRef.current.getLayer()?.batchDraw();
	}, [selectedRoomId, selectedFurnitureId, rooms]);

	// Furniture Transformer
	// biome-ignore lint/correctness/useExhaustiveDependencies: furniture dep ensures ref freshness
	useEffect(() => {
		if (!furnitureTrRef.current) return;
		const node = selectedFurnitureId
			? furnitureGroupRefs.current[selectedFurnitureId]
			: null;
		furnitureTrRef.current.nodes(node ? [node] : []);
		furnitureTrRef.current.getLayer()?.batchDraw();
	}, [selectedFurnitureId, furniture]);

	// Keyboard shortcuts
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setDrawMode(false);
				setDrawRect(null);
				selectFurniture(null);
				setCtxMenu(null);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [selectFurniture]);

	// Close context menu on document click
	useEffect(() => {
		const handler = () => setCtxMenu(null);
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, []);

	// ─── Stage event handlers ──────────────────────────────────────────────

	const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const oldScale = view.scale;
		const direction = e.evt.deltaY < 0 ? 1 : -1;
		const newScale = Math.max(
			SCALE_MIN,
			Math.min(
				SCALE_MAX,
				direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY,
			),
		);

		// Zoom toward cursor position
		const ptInWorld = {
			x: (pointer.x - view.x) / oldScale,
			y: (pointer.y - view.y) / oldScale,
		};
		setView({
			scale: newScale,
			x: pointer.x - ptInWorld.x * newScale,
			y: pointer.y - ptInWorld.y * newScale,
		});
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		if (e.evt.button !== 0) return;
		if (e.target !== e.target.getStage()) return;

		if (drawMode) {
			// Draw mode: start rectangle drawing
			const screenPos = stageRef.current?.getPointerPosition();
			if (!screenPos) return;
			const worldPos = toWorld(screenPos);
			setDrawRect({
				start: { x: snap(worldPos.x), y: snap(worldPos.y) },
				current: worldPos,
			});
		} else {
			// Pan mode: record origin (panning starts after threshold in global handler)
			panOrigin.current = {
				mx: e.evt.clientX,
				my: e.evt.clientY,
				tx: view.x,
				ty: view.y,
			};
		}
	};

	const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
		if (!drawMode || !drawRect) return;
		const screenPos = stageRef.current?.getPointerPosition();
		if (!screenPos) return;
		const worldPos = toWorld(screenPos);
		setDrawRect((d) => (d ? { ...d, current: worldPos } : null));
	};

	const handleMouseUp = () => {
		if (!drawMode || !drawRect) return;
		const x = Math.min(drawRect.start.x, drawRect.current.x);
		const y = Math.min(drawRect.start.y, drawRect.current.y);
		const w = snap(Math.abs(drawRect.current.x - drawRect.start.x));
		const h = snap(Math.abs(drawRect.current.y - drawRect.start.y));
		if (w >= MIN_SIZE && h >= MIN_SIZE) addRoom(x, y, w, h);
		setDrawMode(false);
		setDrawRect(null);
	};

	const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
		// Ignore click if we were panning (click fires after drag ends)
		if (justPanned.current) {
			justPanned.current = false;
			return;
		}
		if (e.target === e.target.getStage()) {
			selectRoom(null);
			selectFurniture(null);
		}
	};

	const handleStageContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.evt.preventDefault();
		setCtxMenu(null);
	};

	// ─── Grid (dynamic, covers visible viewport in world space) ──────────

	const visMinX = -view.x / view.scale;
	const visMinY = -view.y / view.scale;
	const visMaxX = visMinX + width / view.scale;
	const visMaxY = visMinY + height / view.scale;
	const gx0 = Math.floor(visMinX / GRID_SIZE) * GRID_SIZE;
	const gy0 = Math.floor(visMinY / GRID_SIZE) * GRID_SIZE;
	const gx1 = Math.ceil(visMaxX / GRID_SIZE) * GRID_SIZE;
	const gy1 = Math.ceil(visMaxY / GRID_SIZE) * GRID_SIZE;

	const gridLines: React.ReactNode[] = [];
	for (let x = gx0; x <= gx1; x += GRID_SIZE) {
		gridLines.push(
			<Line
				key={`v${x}`}
				points={[x, gy0, x, gy1]}
				stroke="#2a2a3a"
				strokeWidth={0.5}
			/>,
		);
	}
	for (let y = gy0; y <= gy1; y += GRID_SIZE) {
		gridLines.push(
			<Line
				key={`h${y}`}
				points={[gx0, y, gx1, y]}
				stroke="#2a2a3a"
				strokeWidth={0.5}
			/>,
		);
	}

	// ─── Drawing preview ──────────────────────────────────────────────────

	const preview = drawRect
		? {
				x: Math.min(drawRect.start.x, drawRect.current.x),
				y: Math.min(drawRect.start.y, drawRect.current.y),
				width: Math.abs(drawRect.current.x - drawRect.start.x),
				height: Math.abs(drawRect.current.y - drawRect.start.y),
			}
		: null;

	// Context menu helper: screen coords from Konva event
	const ctxMenuPos = (_e: Konva.KonvaEventObject<MouseEvent>): Point | null =>
		stageRef.current?.getPointerPosition() ?? null;

	const cursor = grabbing ? 'grabbing' : drawMode ? 'crosshair' : 'default';

	return (
		<>
			<Stage
				ref={stageRef}
				width={width}
				height={height}
				x={view.x}
				y={view.y}
				scaleX={view.scale}
				scaleY={view.scale}
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onClick={handleStageClick}
				onContextMenu={handleStageContextMenu}
				style={{ cursor }}
			>
				{/* Grid */}
				<Layer listening={false}>{gridLines}</Layer>

				{/* Main content */}
				<Layer>
					{/* Rooms */}
					{rooms.map((room) => {
						const selected = room.id === selectedRoomId && !selectedFurnitureId;
						return (
							<Group
								key={room.id}
								x={room.x}
								y={room.y}
								rotation={room.rotation}
								draggable={!drawMode}
								ref={(node) => {
									roomGroupRefs.current[room.id] = node;
								}}
								onClick={(e) => {
									if (drawMode) return;
									e.cancelBubble = true;
									selectRoom(room.id);
								}}
								onContextMenu={(e) => {
									e.evt.preventDefault();
									e.cancelBubble = true;
									selectRoom(room.id);
									const pos = ctxMenuPos(e);
									if (pos)
										setCtxMenu({
											x: pos.x,
											y: pos.y,
											type: 'room',
											id: room.id,
										});
								}}
								onDragEnd={(e) => {
									updateRoom(room.id, {
										x: snap(e.target.x()),
										y: snap(e.target.y()),
									});
								}}
								onTransformEnd={(e) => {
									const node = e.target;
									const sx = node.scaleX();
									const sy = node.scaleY();
									node.scaleX(1);
									node.scaleY(1);
									updateRoom(room.id, {
										x: node.x(),
										y: node.y(),
										width: Math.max(MIN_SIZE, room.width * Math.abs(sx)),
										height: Math.max(MIN_SIZE, room.height * Math.abs(sy)),
										rotation: node.rotation(),
									});
								}}
							>
								<Rect
									width={room.width}
									height={room.height}
									fill={room.color}
									stroke={selected ? '#60a5fa' : '#4a5568'}
									strokeWidth={selected ? 3 : 1.5}
									shadowColor={selected ? '#60a5fa' : 'transparent'}
									shadowBlur={selected ? 16 : 0}
									cornerRadius={6}
								/>
								<Text
									x={0}
									y={room.height / 2 - 10}
									width={room.width}
									text={room.name}
									fontSize={14}
									fill="rgba(255,255,255,0.7)"
									align="center"
								/>
							</Group>
						);
					})}

					{/* Furniture */}
					{furniture.map((f) => {
						const selected = f.id === selectedFurnitureId;
						const color = FURNITURE_COLORS[f.type] ?? '#4a5568';
						const icon = FURNITURE_ICONS[f.type] ?? '📦';
						return (
							<Group
								key={f.id}
								x={f.x}
								y={f.y}
								rotation={f.rotation}
								draggable
								ref={(node) => {
									furnitureGroupRefs.current[f.id] = node;
								}}
								onClick={(e) => {
									e.cancelBubble = true;
									selectFurniture(f.id);
									selectRoom(f.roomId);
									openDetail(f.id);
								}}
								onContextMenu={(e) => {
									e.evt.preventDefault();
									e.cancelBubble = true;
									selectFurniture(f.id);
									const pos = ctxMenuPos(e);
									if (pos)
										setCtxMenu({
											x: pos.x,
											y: pos.y,
											type: 'furniture',
											id: f.id,
										});
								}}
								onDragEnd={(e) => {
									updateFurniture(f.id, { x: e.target.x(), y: e.target.y() });
								}}
								onTransformEnd={(e) => {
									const node = e.target;
									const sx = node.scaleX();
									const sy = node.scaleY();
									node.scaleX(1);
									node.scaleY(1);
									updateFurniture(f.id, {
										x: node.x(),
										y: node.y(),
										width: Math.max(40, f.width * Math.abs(sx)),
										height: Math.max(30, f.height * Math.abs(sy)),
										rotation: node.rotation(),
									});
								}}
							>
								<Rect
									width={f.width}
									height={f.height}
									fill={color}
									stroke={selected ? '#f59e0b' : 'rgba(255,255,255,0.12)'}
									strokeWidth={selected ? 2.5 : 1}
									shadowColor={selected ? '#f59e0b' : 'transparent'}
									shadowBlur={selected ? 14 : 0}
									cornerRadius={5}
									opacity={0.92}
								/>
								<Text text={icon} x={6} y={6} fontSize={18} />
								<Text
									text={f.label}
									x={0}
									y={f.height / 2 - 8}
									width={f.width}
									align="center"
									fontSize={12}
									fill="#fff"
								/>
							</Group>
						);
					})}

					{/* Room Transformer (파란색) */}
					<Transformer
						ref={roomTrRef}
						borderStroke="#60a5fa"
						anchorStroke="#60a5fa"
						anchorFill="#0f172a"
						anchorSize={10}
						anchorCornerRadius={3}
						rotateEnabled
						keepRatio={false}
					/>

					{/* Furniture Transformer (황금색) */}
					<Transformer
						ref={furnitureTrRef}
						borderStroke="#f59e0b"
						anchorStroke="#f59e0b"
						anchorFill="#0f172a"
						anchorSize={10}
						anchorCornerRadius={3}
						rotateEnabled
						keepRatio={false}
					/>
				</Layer>

				{/* Drawing preview layer */}
				{drawMode && preview && preview.width > 4 && preview.height > 4 && (
					<Layer listening={false}>
						<Rect
							x={preview.x}
							y={preview.y}
							width={preview.width}
							height={preview.height}
							fill="rgba(96,165,250,0.12)"
							stroke="#60a5fa"
							strokeWidth={2}
							dash={[6, 3]}
							cornerRadius={6}
						/>
					</Layer>
				)}
			</Stage>

			{/* Context Menu */}
			{ctxMenu && (
				// biome-ignore lint/a11y/noStaticElementInteractions: context menu click isolation
				// biome-ignore lint/a11y/useKeyWithClickEvents: context menu does not need keyboard equivalent
				<div
					style={{
						position: 'absolute',
						left: ctxMenu.x,
						top: ctxMenu.y,
						background: '#1e293b',
						border: '1px solid #334155',
						borderRadius: 10,
						padding: '4px 0',
						zIndex: 400,
						minWidth: 140,
						boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<div
						style={{
							padding: '6px 14px 8px',
							fontSize: 11,
							color: '#64748b',
							borderBottom: '1px solid #334155',
							fontWeight: 600,
						}}
					>
						{ctxMenu.type === 'room'
							? (rooms.find((r) => r.id === ctxMenu.id)?.name ?? '방')
							: (furniture.find((f) => f.id === ctxMenu.id)?.label ?? '가구')}
					</div>
					{ctxMenu.type === 'furniture' && (
						<button
							type="button"
							onClick={() => {
								openDetail(ctxMenu.id);
								setCtxMenu(null);
							}}
							style={menuItemStyle}
						>
							📂 상세 보기
						</button>
					)}
					<button
						type="button"
						onClick={() => {
							if (ctxMenu.type === 'room') deleteRoom(ctxMenu.id);
							else deleteFurniture(ctxMenu.id);
							setCtxMenu(null);
						}}
						style={{ ...menuItemStyle, color: '#f87171' }}
					>
						🗑️ 삭제
					</button>
				</div>
			)}

			{/* Empty state */}
			{rooms.length === 0 && !drawMode && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none',
					}}
				>
					<div style={{ textAlign: 'center', color: '#475569' }}>
						<div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
						<div style={{ fontSize: 16 }}>방을 먼저 추가하세요</div>
						<div style={{ fontSize: 13, marginTop: 4 }}>
							사이드바의 "방 추가" 버튼을 눌러보세요
						</div>
					</div>
				</div>
			)}

			{/* Drawing hint */}
			{drawMode && (
				<div
					style={{
						position: 'absolute',
						bottom: 56,
						left: '50%',
						transform: 'translateX(-50%)',
						background: '#1e293b',
						border: '1px solid #60a5fa',
						borderRadius: 8,
						padding: '8px 20px',
						color: '#60a5fa',
						fontSize: 13,
						pointerEvents: 'none',
					}}
				>
					{drawRect
						? '드래그해서 방 크기를 조절하세요'
						: '드래그해서 방을 그려보세요 · ESC 취소'}
				</div>
			)}

			{/* Zoom controls */}
			<div
				style={{
					position: 'absolute',
					bottom: 16,
					right: 16,
					display: 'flex',
					alignItems: 'center',
					gap: 6,
					background: '#1e293b',
					border: '1px solid #334155',
					borderRadius: 8,
					padding: '4px 8px',
				}}
			>
				<button
					type="button"
					onClick={() =>
						setView((v) => ({
							...v,
							scale: Math.max(SCALE_MIN, v.scale / SCALE_BY),
						}))
					}
					style={zoomBtn}
					title="축소"
				>
					−
				</button>
				<span
					style={{
						fontSize: 12,
						color: '#94a3b8',
						minWidth: 40,
						textAlign: 'center',
					}}
				>
					{Math.round(view.scale * 100)}%
				</span>
				<button
					type="button"
					onClick={() =>
						setView((v) => ({
							...v,
							scale: Math.min(SCALE_MAX, v.scale * SCALE_BY),
						}))
					}
					style={zoomBtn}
					title="확대"
				>
					＋
				</button>
				<div
					style={{
						width: 1,
						height: 16,
						background: '#334155',
						margin: '0 2px',
					}}
				/>
				<button
					type="button"
					onClick={() => setView({ x: 0, y: 0, scale: 1 })}
					style={{ ...zoomBtn, fontSize: 11, color: '#64748b' }}
					title="뷰 초기화"
				>
					⊙
				</button>
			</div>

			{/* Pan hint */}
			<div
				style={{
					position: 'absolute',
					bottom: 16,
					left: '50%',
					transform: 'translateX(-50%)',
					fontSize: 11,
					color: '#334155',
					pointerEvents: 'none',
				}}
			>
				빈 공간 드래그로 이동 · 스크롤로 줌
			</div>
		</>
	);
}

const menuItemStyle: React.CSSProperties = {
	display: 'block',
	width: '100%',
	padding: '9px 14px',
	background: 'none',
	border: 'none',
	color: '#e2e8f0',
	fontSize: 13,
	cursor: 'pointer',
	textAlign: 'left',
};

const zoomBtn: React.CSSProperties = {
	background: 'none',
	border: 'none',
	color: '#94a3b8',
	cursor: 'pointer',
	fontSize: 16,
	lineHeight: 1,
	padding: '2px 4px',
	borderRadius: 4,
};
