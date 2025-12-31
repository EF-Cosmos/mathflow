import { MoveHorizontal, Combine, X, Divide } from 'lucide-react';
import { TermAction } from '../InteractiveFormula';

interface TermOperationsProps {
  activeAction: TermAction | null;
  onActionChange: (action: TermAction | null) => void;
  disabled?: boolean;
}

const termActions: { 
  action: TermAction; 
  icon: typeof MoveHorizontal; 
  label: string; 
  shortcut: string; 
  color: string;
  description: string;
}[] = [
  { action: 'move', icon: MoveHorizontal, label: '移项', shortcut: 'M', color: 'blue', description: '将项移到等号另一边' },
  { action: 'combine', icon: Combine, label: '合并', shortcut: 'C', color: 'green', description: '合并同类项' },
  { action: 'multiply', icon: X, label: '乘法', shortcut: '*', color: 'purple', description: '两边同乘某项' },
  { action: 'divide', icon: Divide, label: '除法', shortcut: '/', color: 'orange', description: '两边同除某项' },
];

const colorMap: Record<string, { bg: string; text: string; ring: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-400',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-800/40',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-400',
    hover: 'hover:bg-green-100 dark:hover:bg-green-800/40',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-400',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-800/40',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-400',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-800/40',
  },
};

export default function TermOperations({
  activeAction,
  onActionChange,
  disabled = false,
}: TermOperationsProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
        项操作 <span className="text-gray-400">(点击公式中的项执行)</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {termActions.map(({ action, icon: Icon, label, shortcut, color, description }) => {
          const isActive = activeAction === action;
          const colors = colorMap[color];
          
          return (
            <button
              key={action}
              onClick={() => onActionChange(isActive ? null : action)}
              disabled={disabled}
              title={description}
              className={`
                relative flex items-center gap-2 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150
                ${isActive 
                  ? `${colors.bg} ${colors.text} ring-2 ${colors.ring}` 
                  : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${colors.hover} border border-gray-200 dark:border-gray-700`
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Icon size={18} />
              <span>{label}</span>
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {shortcut}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
