import React, { useState, useEffect, useRef } from 'react';

export interface Option {
  value: string;
  label: string;
  highlightedLabel?: React.ReactNode;
  score?: number;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<Option[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  debounceMs?: number;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
  disabled = false,
  emptyMessage = 'No results found',
  debounceMs = 250,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set the selected label when value changes
  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      setSelectedLabel(selectedOption.label);
    } else if (!value) {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Helper function to highlight matching text in search results
  const highlightMatches = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const parts = [];
    let lastIndex = 0;
    const textLower = text.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // Create a map to track which parts of the text have been highlighted
    const highlightMap = new Array(text.length).fill(false);
    
    // For each search term, find and mark all occurrences in the text
    queryTerms.forEach(term => {
      let startIndex = 0;
      let index;
      while ((index = textLower.indexOf(term, startIndex)) !== -1) {
        // Mark this range as highlighted
        for (let i = index; i < index + term.length; i++) {
          highlightMap[i] = true;
        }
        startIndex = index + term.length;
      }
    });
    
    // Now go through the text and create highlighted spans based on the map
    let inHighlight = false;
    let currentChunk = '';
    
    for (let i = 0; i < text.length; i++) {
      if (highlightMap[i] !== inHighlight) {
        // We're transitioning between highlight and non-highlight
        if (currentChunk) {
          parts.push(
            inHighlight ? 
              <span key={lastIndex} className="bg-yellow-200 font-medium">{currentChunk}</span> : 
              currentChunk
          );
          lastIndex++;
        }
        currentChunk = text[i];
        inHighlight = highlightMap[i];
      } else {
        // Continue current chunk
        currentChunk += text[i];
      }
    }
    
    // Add the last chunk
    if (currentChunk) {
      parts.push(
        inHighlight ? 
          <span key={lastIndex} className="bg-yellow-200 font-medium">{currentChunk}</span> : 
          currentChunk
      );
    }
    
    return <>{parts}</>;
  };

  // Perform search with debouncing
  useEffect(() => {
    if (!searchTerm && !isOpen) return;

    setIsLoading(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        let results = await onSearch(searchTerm);
        
        // Add highlighting to results
        results = results.map(option => ({
          ...option,
          highlightedLabel: highlightMatches(option.label, searchTerm),
        }));
        
        // Sort by score if available
        if (results.length > 0 && results[0].score !== undefined) {
          results.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
        
        setOptions(results.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error('Search error:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, onSearch, debounceMs, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionSelect = (option: Option) => {
    onChange(option.value);
    setSelectedLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Initial search when dropdown opens
    if (options.length === 0 && !searchTerm) {
      setSearchTerm(' '); // Trigger search with empty space
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={selectedLabel || placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-buttonBorder rounded shadow-lg max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 cursor-pointer hover:bg-darkerBackground"
                onClick={() => handleOptionSelect(option)}
              >
                {option.highlightedLabel || option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
