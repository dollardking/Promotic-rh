// app/ModalAppElement.tsx
'use client';

import { useEffect } from 'react';
import Modal from 'react-modal';

export default function ModalAppElement() {
  useEffect(() => {
    const setAppElement = () => {
      const element = document.getElementById('__next');
      if (element) {
        Modal.setAppElement('#__next');
      } else {
        // Retry si pas encore dans le DOM
        requestAnimationFrame(setAppElement);
      }
    };

    setAppElement();

    return () => {
      // Nettoyage au démontage
    };
  }, []);

  return null;
}