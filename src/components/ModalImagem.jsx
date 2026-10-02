import React from 'react';
import './ModalImagem.css';

function isVideoUrl(url) {
  if (!url) return false;
  const clean = url.split('?')[0];
  return /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i.test(clean);
}

export default function ModalImagem({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="modal-imagem-overlay" onClick={onClose}>
      <div className="modal-imagem-container" onClick={e => e.stopPropagation()}>
        <button className="modal-imagem-fechar" onClick={onClose}>✕</button>
        {isVideoUrl(url) ? (
          <video
            src={url}
            className="modal-imagem-img"
            autoPlay
            loop
            muted
            playsInline
            controls
            style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: '10px' }}
          />
        ) : (
          <img src={url} alt="Visualização em tamanho maior" className="modal-imagem-img" />
        )}
      </div>
    </div>
  );
}
