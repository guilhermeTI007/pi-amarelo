import React from 'react';
import './ModalImagem.css';

export default function ModalImagem({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="modal-imagem-overlay" onClick={onClose}>
      <div className="modal-imagem-container" onClick={e => e.stopPropagation()}>
        <button className="modal-imagem-fechar" onClick={onClose}>X</button>
        <img src={url} alt="Visualização em tamanho maior" className="modal-imagem-img" />
      </div>
    </div>
  );
}
