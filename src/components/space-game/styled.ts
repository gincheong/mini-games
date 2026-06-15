import styled from 'styled-components';

export const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #050010;
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
  opacity: 0.18;
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
  padding: 0 12px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    top: 10px;
    padding: 0 8px;
    gap: 8px;
  }
`;

export const StatBox = styled.div`
  background: rgba(10, 0, 40, 0.75);
  color: #e0d0ff;
  padding: 10px 20px;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #9b5de5;
  box-shadow: 0 0 12px rgba(155, 93, 229, 0.4);

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

export const Message = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(5, 0, 20, 0.92);
  color: #e0d0ff;
  padding: 30px 50px;
  border-radius: 20px;
  text-align: center;
  z-index: 100;
  border: 3px solid #9b5de5;
  box-shadow: 0 0 32px rgba(155, 93, 229, 0.5), 0 0 8px rgba(0, 200, 255, 0.2);
  width: max-content;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 20px 24px;
    border-radius: 14px;
    font-size: 0.95rem;
  }
`;

export const Input = styled.input`
  background: rgba(155, 93, 229, 0.1);
  color: #e0d0ff;
  border: 2px solid #9b5de5;
  padding: 10px 16px;
  font-size: 1.2rem;
  border-radius: 10px;
  width: 100px;
  text-align: center;
  margin-top: 12px;

  &:focus {
    outline: none;
    border-color: #c77dff;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 8px 12px;
    width: 80px;
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #7b2ff7, #00c8ff);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 16px rgba(123, 47, 247, 0.5);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 24px rgba(123, 47, 247, 0.8);
  }

  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 1rem;
    margin-top: 16px;
  }
`;
