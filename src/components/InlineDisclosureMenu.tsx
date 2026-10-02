import React, { useState } from 'react';
import { MoreHorizontal, Trash2, X } from 'lucide-react';
import { playTapSound } from '../lib/celebration';

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface InlineDisclosureMenuProps {
  menuItems: MenuItem[];
  showDelete?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
  defaultOpen?: boolean;
  triggerLabel?: string;
  className?: string;
}

export const InlineDisclosureMenu: React.FC<InlineDisclosureMenuProps> = ({
  menuItems = [],
  showDelete = false,
  onDelete,
  deleteLabel = 'Delete',
  defaultOpen = false,
  triggerLabel,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    playTapSound();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    playTapSound();
    item.onClick?.();
  };

  const handleDelete = () => {
    playTapSound();
    onDelete?.();
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] shadow-sm transition-all duration-300 font-sans ${className}`}
      style={{
        boxShadow: '-2px -2px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(163,174,187,0.35)',
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={triggerLabel || 'Toggle actions menu'}
        className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? 'bg-[#F06A05] text-white btn-orange-shadow'
            : 'bg-white text-[#1F140A] hover:bg-[#F4F6F8] border border-[#D6DCE2]'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Close</span>
          </>
        ) : (
          <>
            <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            {triggerLabel && <span>{triggerLabel}</span>}
          </>
        )}
      </button>

      {/* Disclosed Items */}
      {isOpen && (
        <div
          role="menu"
          className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200 overflow-x-auto py-0.5"
        >
          {menuItems.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
              title={item.label}
              className={`h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all duration-150 cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-[#7A6658]'
                  : 'bg-white/80 hover:bg-white text-[#1F140A] hover:text-[#F06A05] border border-[#D6DCE2]'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center text-inherit shrink-0">
                {item.icon}
              </span>
              <span className="text-[11px] font-extrabold">{item.label}</span>
            </button>
          ))}

          {/* Delete Option */}
          {showDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={handleDelete}
              title={deleteLabel}
              className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-[#B4382B] bg-red-50 hover:bg-red-100/80 border border-red-200 transition-all duration-150 cursor-pointer select-none whitespace-nowrap active:scale-95 ml-0.5"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
              <span className="text-[11px] font-extrabold">{deleteLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineDisclosureMenu;
