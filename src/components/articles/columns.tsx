import { ColumnDef } from "@tanstack/react-table";
import { Article } from "@/lib/types/article";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Column definitions for the Articles data table
 * Following Single Responsibility Principle by separating column definitions from the table component
 * Using TypeScript generics for type safety
 */
export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const article = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[300px]">{article.title}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[300px]">{article.url}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "addedAt",
    header: "Added",
    cell: ({ row }) => {
      // Type safety: we know addedAt is a Date because of our Article interface
      const date = row.original.addedAt;
      // Format date using date-fns
      return <div>{format(date, "MMM d, yyyy")}</div>;
    },
  },
  // Domain and status columns removed as requested
  {
    id: "actions",
    cell: ({ row, handleStatusChange, handleDeleteArticle }: { 
      row: any, 
      handleStatusChange?: (id: string, status: 'read' | 'unread') => void,
      handleDeleteArticle?: (id: string) => void 
    }) => {
      const article = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(article.url)}
            >
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(article.url, "_blank")}
            >
              Open in browser
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const newStatus = article.status === "read" ? "unread" : "read";
                if (handleStatusChange) {
                  handleStatusChange(article.id, newStatus);
                }
              }}
            >
              {article.status === "read" ? "Mark as unread" : "Mark as read"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                if (handleDeleteArticle) {
                  handleDeleteArticle(article.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
