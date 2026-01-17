import { Grid3x3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface GridDensityToggleProps {
    density: 5 | 7;
    onDensityChange: (density: 5 | 7) => void;
}

export function GridDensityToggle({ density, onDensityChange }: GridDensityToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDensityChange(5)}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-background hover:text-foreground",
                                density === 5 && "bg-background text-foreground shadow-sm"
                            )}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Standard View</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDensityChange(7)}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-background hover:text-foreground",
                                density === 7 && "bg-background text-foreground shadow-sm"
                            )}
                        >
                            <Grid3x3 size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Dense View</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
