'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';

type Option = {
  value: string;
  label: ReactNode; // ラベルとしてReactコンポーネント(アイコン+テキスト)を受け取れるようにする
};

type Props = {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = '選択してください',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // 外側をクリックしたときにドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    // 'none'という特別な値で「未選択」を扱う
    onChange(optionValue === 'none' ? null : optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 py-2 flex items-center justify-between text-xs bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div className="flex-grow text-left">
          {selectedOption ? selectedOption.label : <span className="text-gray-500">{placeholder}</span>}
        </div>
        <FiChevronDown
          className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* ドロップダウンパネル */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-md max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}