import type { FC } from 'react';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterControls: FC<FilterControlsProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="my-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in food, supplements, or skin notes..."
          className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          aria-label="Search logs"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button 
                onClick={() => setSearchTerm('')} 
                className="text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
            >
              <i className="fa-solid fa-times-circle"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;