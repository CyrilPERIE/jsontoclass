"use client";

import { useState } from "react";
import { transformToCode, Language } from "@/lib/transformer";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.PYTHON);
  const [output, setOutput] = useState("");
  const [useGettersSetters, setUseGettersSetters] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    try {
      if (newText.trim()) {
        const result = transformToCode(e.target.value as Language, text, useGettersSetters)
        setOutput(result);
      } else {
        setOutput("");
      }
    } catch (error) {
      console.error('Error transforming JSON: ', error);
      setOutput(selectedLanguage === Language.PYTHON ? "# Invalid JSON" : "// Invalid JSON");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const customStyle = {
    backgroundColor: 'var(--bg-700)',
    margin: 0,
    padding: '1rem',
    borderRadius: 0,
    height: '100%',
    fontSize: '0.875rem',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-800)] flex flex-col p-10 gap-4">
      <div className="flex items-center gap-4">
        <select 
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value as Language);
            if (text.trim()) {
              const result = transformToCode(e.target.value as Language, text, useGettersSetters);
              setOutput(result);
            }
          }}
          className="p-2 rounded border border-[var(--bg-600)] bg-[var(--bg-700)] text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--text-500)]"
        >
          <option value={Language.PYTHON}>Python</option>
          <option value={Language.JAVA}>Java</option>
          <option value={Language.TYPESCRIPT}>TypeScript</option>
          <option value={Language.JAVASCRIPT}>JavaScript</option>
          <option value={Language.GO}>Go</option>
          <option value={Language.RUBY}>Ruby</option>
          {/* C# programming language option */}
          {/* Rust programming language option */}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="gettersSetters"
            checked={useGettersSetters}
            onChange={(e) => {
              setUseGettersSetters(e.target.checked);
              if (text.trim()) {
                const result = transformToCode(e.target.value as Language, text, useGettersSetters)
                setOutput(result);
              }
            }}
            className="h-4 w-4 accent-[var(--text-500)] bg-[var(--bg-700)] border-[var(--bg-600)]"
          />
          <label htmlFor="gettersSetters" className="text-sm text-[var(--text-200)]">
            Generate getters/setters
          </label>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-10">
        <div className="flex-1 bg-[var(--bg-700)] rounded-lg overflow-hidden border border-[var(--bg-600)]">
          <textarea
            className="w-full h-full bg-transparent text-[var(--text-200)] resize-none p-4 overflow-y-auto focus:outline-none"
            placeholder="Paste your JSON here"
            value={text}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1 bg-[var(--bg-700)] rounded-lg overflow-hidden border border-[var(--bg-600)] relative group">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded bg-[var(--bg-600)] text-[var(--text-200)] 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     hover:bg-[var(--bg-500)] focus:outline-none focus:ring-2 focus:ring-[var(--text-500)]"
            title={isCopied ? "Copied!" : "Copy to clipboard"}
          >
            {isCopied ? (
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500 cursor-pointer" />
            ) : (
              <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer" />
            )}
          </button>
          <SyntaxHighlighter
            language={selectedLanguage}
            style={vscDarkPlus}
            customStyle={customStyle}
            showLineNumbers={true}
          >
            {output || '# Output will appear here'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
