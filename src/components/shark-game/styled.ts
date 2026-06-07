import styled from 'styled-components';

export const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #001a33;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Pretendard', sans-serif;
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

export const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  opacity: 0.3;
  z-index: 1;
`;

export const UIOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  pointer-events: none;
  z-index: 10;
`;

export const StatBox = styled.div`
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px 20px;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #00aaff;
`;

export const Message = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 30px 50px;
  border-radius: 20px;
  text-align: center;
  z-index: 100;
  border: 4px solid #00aaff;
`;

export const Button = styled.button`
  background: #00aaff;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    background: #00d4ff;
  }
`;
