import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathRenderer({ latex, displayMode = false, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#ef4444',
          trust: true,
          strict: false,
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<span class="text-red-500 text-sm">Invalid LaTeX: ${latex}</span>`;
        }
      }
    }
  }, [latex, displayMode]);

  if (!latex) {
    return <span className="text-gray-400 italic">Empty formula</span>;
  }

  return <div ref={containerRef} className={`katex-container ${className}`} />;
}
