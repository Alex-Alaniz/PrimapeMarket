
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, SortAsc, SortDesc } from "lucide-react";

interface MarketFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export function MarketFilters({ searchQuery, setSearchQuery, sortOrder, setSortOrder }: MarketFiltersProps) {
  return (
    <div className="flex gap-4 mb-6 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        title="Sort by date"
      >
        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
      </Button>
    </div>
  );
}
