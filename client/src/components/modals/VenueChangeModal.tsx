import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VenueDetails {
  id: number;
  name: string;
  capacity: number;
  location: string;
  facilities: string;
}

interface VenueChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueChange: {
    classId: number;
    className: string;
    originalVenue: VenueDetails;
    newVenue: VenueDetails;
    timeAdjustment: number; // in minutes
    date: string;
  };
  onAccept: () => void;
  onRequestDifferent: () => void;
}

export default function VenueChangeModal({
  open,
  onOpenChange,
  venueChange,
  onAccept,
  onRequestDifferent,
}: VenueChangeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        "POST",
        "/api/venue-changes/accept",
        {
          classId: venueChange.classId,
          newVenueId: venueChange.newVenue.id,
          date: venueChange.date,
          timeAdjustment: venueChange.timeAdjustment,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept venue change");
      }

      toast({
        title: "Venue change accepted",
        description: "The venue change has been accepted successfully.",
      });

      onAccept();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to accept venue change:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept venue change",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <span className="material-icons text-red-600">warning</span>
            </div>
            <div className="ml-4">
              <DialogTitle>Venue Change Required</DialogTitle>
              <DialogDescription className="mt-2">
                The current venue ({venueChange.originalVenue.name}) is already occupied by another class. 
                Our AI system has found an alternative venue based on your class requirements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 p-3 bg-neutral-50 rounded-md">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">New Venue:</p>
              <p className="text-sm text-muted-foreground">{venueChange.newVenue.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Capacity:</p>
              <p className="text-sm text-muted-foreground">{venueChange.newVenue.capacity} students</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground">Facilities:</p>
            <p className="text-sm text-muted-foreground">{venueChange.newVenue.facilities}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground">Time Adjustment:</p>
            <p className="text-sm text-muted-foreground">
              {venueChange.timeAdjustment > 0 
                ? `Class will start ${venueChange.timeAdjustment} minutes later` 
                : venueChange.timeAdjustment < 0
                ? `Class will start ${Math.abs(venueChange.timeAdjustment)} minutes earlier`
                : "No time adjustment required"
              }
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onRequestDifferent}
          >
            Request Different Venue
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Processing...
              </>
            ) : (
              "Accept Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
