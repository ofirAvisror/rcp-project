import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type CategorySidebarProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-64 p-4 border-r bg-white dark:bg-gray-900">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        Filter by Category
      </h2>

      <ScrollArea className="h-[500px] pr-2">
        <div className="flex flex-col gap-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => onSelectCategory("")}
          >
            All
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
