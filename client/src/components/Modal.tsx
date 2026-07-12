import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-neutral-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-neutral-bg/40">
          <h3 className="text-base font-semibold text-neutral-text">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-muted hover:text-neutral-text text-2xl font-light transition-colors focus:outline-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-muted/10"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-sm text-neutral-text overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};
