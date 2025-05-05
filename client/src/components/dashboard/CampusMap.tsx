import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

export default function CampusMap() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Card className={isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold">Campus Map</CardTitle>
        {isFullScreen && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFullScreen(false)}
            className="h-8 w-8 p-0"
          >
            <span className="material-icons">close</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <AspectRatio ratio={16 / 9} className="overflow-hidden bg-neutral-200 relative mb-3 rounded-md">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-icons text-4xl text-neutral-400">map</span>
              <p className="text-muted-foreground mt-2">Interactive campus map</p>
            </div>
          </div>
        </AspectRatio>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => setIsFullScreen(true)}
        >
          View Full Map
        </Button>
      </CardContent>
    </Card>
  );
}
