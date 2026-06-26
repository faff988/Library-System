import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteBookModal({ isOpen, onClose, onConfirm, book }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Viewport breakout overlay drop mask */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
      />

      {/* Structured Warning Panel Box */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Absolute Exit cross icon trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <X size={16} />
        </button>

        {/* Coral Trash Emblem */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 border border-red-100 shadow-3xs">
            <Trash2 size={18} />
          </div>
        </div>

        {/* Target warning messages definitions labels */}
        <h3 className="text-base font-black text-gray-900 mb-1">Delete Book Record?</h3>
        <p className="text-xs font-bold text-gray-400 mb-4">You are about to permanently delete:</p>

        {/* Target Asset Identity Card display box banner matching mockup layout precisely */}
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 mb-4 text-left">
          <h4 className="text-xs font-black text-red-900 mb-0.5">{book.title}</h4>
          <p className="text-[11px] font-bold text-red-600/80 leading-normal">
            {book.author} <span className="mx-1.5 text-red-200">•</span> ISBN: {book.isbn || "N/A"} <span className="mx-1.5 text-red-200">•</span> {book.totalCopies || book.totalCopies === 0 ? book.totalCopies : "0"} copies
          </p>
        </div>

        {/* Action Warning Label Context Alert Block */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5 mb-6 text-left">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-amber-700 leading-normal">
            This action cannot be undone. All borrow history will be lost.
          </p>
        </div>

        {/* Binary choice control row panels panel */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:bg-gray-50 transition tracking-wide shadow-3xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm(book.id);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#DF4A4A] hover:bg-red-700 text-xs font-black text-white transition tracking-wide shadow-xs"
          >
            Yes, Delete Permanently
          </button>
        </div>

      </div>
    </div>
  );
}