import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS, PAGE_SIZE_OPTIONS } from "@/lib/constants";
import type { PropertyStatus } from "@shared/schema";

interface SearchAndFiltersProps {
  searchParams: {
    q: string;
    status?: PropertyStatus;
    type: 'unit' | 'parent' | 'all';
    page: number;
    pageSize: number;
    sort: string;
    dir: 'asc' | 'desc';
  };
  onParamsChange: (params: any) => void;
}

const TYPE_FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "unit" as const, label: "Units" },
  { value: "parent" as const, label: "Parents" },
];

const STATUS_FILTERS = [
  { value: undefined, label: "All" },
  { value: "AVAILABLE" as PropertyStatus, label: "Available" },
  { value: "RESERVED" as PropertyStatus, label: "Reserved" },
  { value: "RENTED" as PropertyStatus, label: "Rented" },
];

export default function SearchAndFilters({ searchParams, onParamsChange }: SearchAndFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchParams.q);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchParams.q) {
        onParamsChange({ q: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchParams.q, onParamsChange]);

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(searchParams.q);
  }, [searchParams.q]);

  return (
    <Card className="mb-8" data-testid="card-search-filters">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by property name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Type:</span>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((filter) => (
                <Badge
                  key={filter.label}
                  variant={searchParams.type === filter.value ? "default" : "secondary"}
                  className="cursor-pointer hover-elevate"
                  onClick={() => onParamsChange({ type: filter.value, page: 1 })}
                  data-testid={`button-type-${filter.label.toLowerCase()}`}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Status Filter */}
          {searchParams.type !== 'parent' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <div className="flex gap-1">
                {STATUS_FILTERS.map((filter) => (
                  <Badge
                    key={filter.label}
                    variant={searchParams.status === filter.value ? "default" : "secondary"}
                    className="cursor-pointer hover-elevate"
                    onClick={() => onParamsChange({ status: filter.value, page: 1 })}
                    data-testid={`button-status-${filter.label.toLowerCase()}`}
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Sort and Page Size */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Sort by:</label>
              <Select
                value={`${searchParams.sort}-${searchParams.dir}`}
                onValueChange={(value) => {
                  const [sort, dir] = value.split('-');
                  onParamsChange({ sort, dir: dir as 'asc' | 'desc', page: 1 });
                }}
              >
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={`${option.value}-desc`} value={`${option.value}-desc`}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="city-asc">City (A-Z)</SelectItem>
                  <SelectItem value="city-desc">City (Z-A)</SelectItem>
                  <SelectItem value="createdAt-asc">Created (asc)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Show:</label>
              <Select
                value={searchParams.pageSize.toString()}
                onValueChange={(value) => onParamsChange({ pageSize: parseInt(value, 10), page: 1 })}
              >
                <SelectTrigger className="w-20" data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
