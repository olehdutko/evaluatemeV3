'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { COUNTRY_OPTIONS, type CountryOption } from '../../lib/countries';

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  inputClassName?: string;
}

function countryLabel(value: string): string {
  const option = COUNTRY_OPTIONS.find((c) => c.value === value);
  return option ? `${option.flag} ${option.label}` : '';
}

export function CountryAutocomplete({
  value,
  onChange,
  required,
  placeholder = 'Search country',
  inputClassName = 'input-field',
}: CountryAutocompleteProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => COUNTRY_OPTIONS.find((c) => c.value === value) ?? null, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filtered.length]);

  useEffect(() => {
    if (isOpen) {
      setQuery(selected ? `${selected.flag} ${selected.label}` : '');
      // Highlight the selected option when opening
      const selectedIndex = filtered.findIndex((c) => c.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery(selected ? countryLabel(value) : '');
  }, [selected, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  function selectOption(option: CountryOption) {
    onChange(option.value);
    setQuery(countryLabel(option.value));
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setIsOpen(true);
      event.preventDefault();
      return;
    }

    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filtered.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (filtered[highlightedIndex]) {
          selectOption(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={isOpen ? 'country-listbox' : undefined}
        aria-activedescendant={isOpen ? `country-option-${highlightedIndex}` : undefined}
        value={isOpen ? query : selected ? countryLabel(value) : ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery(selected ? countryLabel(value) : '');
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={`${inputClassName} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
        aria-label={isOpen ? 'Close country list' : 'Open country list'}
      >
        {isOpen ? '▾' : '▸'}
      </button>

      {isOpen && (
        <ul
          id="country-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border border-border bg-bg-primary shadow-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-text-secondary">No countries found</li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={`country-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  index === highlightedIndex
                    ? 'bg-bg-secondary text-text-primary'
                    : 'text-text-secondary'
                } ${option.value === value ? 'font-semibold' : ''}`}
              >
                {option.flag} {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
