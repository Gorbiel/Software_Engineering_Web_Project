"use client";

import { useEffect, useRef, useState } from "react";
import {
  debounce,
  formatTagScope,
  getTagBadgeColor,
  searchTags,
  type TagListItem,
} from "@/utils/tags";

interface TagSelectorProps {
  selectedTags: TagListItem[];
  onTagsChange: (tags: TagListItem[]) => void;
  teamId?: number;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  teamId,
  maxTags = 5,
  placeholder = "Search tags...",
  disabled = false,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TagListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await searchTags(query, teamId, true);
        // Filter out already selected tags
        const filteredResults = results.filter(
          (tag) => !selectedTags.some((selected) => selected.id === tag.id)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        setError("Failed to search tags");
        console.error("Tag search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
    debouncedSearch(query);
  };

  // Handle tag selection
  const handleSelectTag = (tag: TagListItem) => {
    if (selectedTags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    onTagsChange([...selectedTags, tag]);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle tag removal
  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
    setError(null);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowDropdown(true);
    }
  };

  const isMaxTagsReached = selectedTags.length >= maxTags;

  return (
    <div className="w-full">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTagBadgeColor(
                tag
              )}`}
            >
              <span>{tag.tag_text}</span>
              <span className="text-xs opacity-70">({formatTagScope(tag)})</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${tag.tag_text}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tag count indicator */}
      <div className="text-sm text-gray-600 mb-2">
        {selectedTags.length} / {maxTags} tags selected
        {isMaxTagsReached && (
          <span className="ml-2 text-amber-600 font-medium">
            (Maximum reached)
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            placeholder={
              isMaxTagsReached
                ? "Maximum tags reached"
                : placeholder
            }
            disabled={disabled || isMaxTagsReached}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled || isMaxTagsReached
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            } ${error ? "border-red-500" : "border-gray-300"}`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && !isMaxTagsReached && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelectTag(tag)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">{tag.tag_text}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getTagBadgeColor(
                    tag
                  )}`}
                >
                  {formatTagScope(tag)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showDropdown &&
          searchQuery.trim().length >= 2 &&
          !isSearching &&
          searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
              No tags found for "{searchQuery}"
            </div>
          )}

        {/* Search hint */}
        {showDropdown && searchQuery.trim().length < 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            Type at least 2 characters to search
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="mt-2 text-sm text-gray-500">
        Search and select up to {maxTags} tags. Global tags are available to all
        users, team tags are specific to your team.
      </p>
    </div>
  );
}

// Made with Bob
