import React, { FC, ReactNode, MouseEvent } from "react";
import styled from "styled-components";
import { IoClose } from "react-icons/io5";
import { THEME } from "../game/ui/layers/phaser/constants";
const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const ModalContent = styled.div`
  background: var(--off-white);
  color: var(--deep-green) !important;
  padding: 20px;
  border-radius: 8px;
  border: 3px solid var(--earthy-brown);
  max-width: 90%;
  margin-top: 20%;
  max-height: 60%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: all;

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const handleWrapperClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return isOpen ? (
    <ModalWrapper onClick={handleWrapperClick}>
      <ModalContent>
        <IoClose
          size={24}
          onClick={onClose}
          color={THEME.deepGreen}
          className="close"
        />
        {children}
      </ModalContent>
    </ModalWrapper>
  ) : null;
};
