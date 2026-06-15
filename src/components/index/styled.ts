import { Link } from '@tanstack/react-router';
import styled from 'styled-components';

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100svh;
  background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 100%);
  color: #fff;
`;

export const Header = styled.header`
  padding: 3rem 2rem 1.5rem;
  text-align: center;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem 1rem;
  }
`;

export const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #7878a0;
  font-size: 1rem;
`;

export const GameGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 2rem;
  flex: 1;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 1.25rem 1.25rem;
  }
`;

export const GameCard = styled(Link)<{ $accent: string }>`
  all: unset;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${(p) => p.$accent}44;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 16px ${(p) => p.$accent}18;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.08);
    border-color: ${(p) => p.$accent}99;
    box-shadow: 0 6px 24px ${(p) => p.$accent}38;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const GameIcon = styled.span`
  font-size: 2.2rem;
  flex-shrink: 0;
`;

export const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const GameName = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #eeeeff;
`;

export const GameDesc = styled.span`
  font-size: 0.85rem;
  color: #7878a0;
`;

export const Footer = styled.footer`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
`;

export const Anchor = styled.a`
  all: unset;
  color: #7878a0;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.15s;

  &:hover {
    color: #c4b5fd;
  }
`;
