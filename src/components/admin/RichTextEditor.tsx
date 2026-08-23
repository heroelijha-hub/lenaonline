'use client';

import React, { useRef, useEffect, useState } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isMounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  if (!isMounted) return <div className="border border-gray-300 rounded-md h-[340px] bg-gray-50 animate-pulse"></div>;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 text-sm text-gray-700">
        <button type="button" onClick={() => execCmd('bold')} className="p-1.5 hover:bg-gray-200 rounded font-bold px-3">B</button>
        <button type="button" onClick={() => execCmd('italic')} className="p-1.5 hover:bg-gray-200 rounded italic px-3">I</button>
        <button type="button" onClick={() => execCmd('underline')} className="p-1.5 hover:bg-gray-200 rounded underline px-3">U</button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button type="button" onClick={() => execCmd('formatBlock', 'H1')} className="p-1.5 hover:bg-gray-200 rounded font-bold px-2">H1</button>
        <button type="button" onClick={() => execCmd('formatBlock', 'H2')} className="p-1.5 hover:bg-gray-200 rounded font-bold px-2">H2</button>
        <button type="button" onClick={() => execCmd('formatBlock', 'P')} className="p-1.5 hover:bg-gray-200 rounded px-2">P</button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded px-2">• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-gray-200 rounded px-2">1. List</button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button type="button" onClick={() => {
          const url = prompt('Entrez l\'URL:');
          if (url) execCmd('createLink', url);
        }} className="p-1.5 hover:bg-gray-200 rounded px-2">Link</button>
        <button type="button" onClick={() => execCmd('unlink')} className="p-1.5 hover:bg-gray-200 rounded px-2">Enlever lien</button>
        <button type="button" onClick={() => execCmd('removeFormat')} className="p-1.5 hover:bg-gray-200 rounded px-2 text-red-600">Nettoyer format</button>
      </div>
      
      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto outline-none prose max-w-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
      />
    </div>
  );
}
