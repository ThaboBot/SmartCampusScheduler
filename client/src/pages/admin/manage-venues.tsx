import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MainLayout from "@/components/layouts/MainLayout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { analyzeVenueUsage } from "@/lib/openai";
import { InsertVenue, Venue } from "@shared/schema";

interface VenuesData {
  user: any;
  venues: Venue[];
  buildings: string[];
}

const venueFormSchema = z.object({
  name: z.string().min(3, {
    message: "Venue name must be at least 3 characters.",
  }),
  capacity: z.coerce.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  facilities: z.string().optional(),
  building: z.string().min(1, {
    message: "Building is required.",
  }),
  floor: z.string().min(1, {
    message: "Floor is required.",
  }),
  roomNumber: z.string().min(1, {
    message: "Room number is required.",
  }),
  isActive: z.boolean().default(true),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

export default function ManageVenuesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analyzingVenueId, setAnalyzingVenueId] = useState<number | null>(null);
  const [venueAnalysis, setVenueAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { data, isLoading } = useQuery<VenuesData>({
    queryKey: ['/api/admin/venues'],
  });

  const createVenueMutation = useMutation({
    mutationFn: async (values: VenueFormValues) => {
      await apiRequest("POST", "/api/admin/venues", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
      setVenueDialogOpen(false);
      toast({
        title: "Venue created",
        description: "The venue has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create venue",
      });
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: VenueFormValues }) => {
      await apiRequest("PATCH", `/api/admin/venues/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
      setVenueDialogOpen(false);
      setEditingVenue(null);
      toast({
        title: "Venue updated",
        description: "The venue has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update venue",
      });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: number) => {
      await apiRequest("DELETE", `/api/admin/venues/${venueId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
      toast({
        title: "Venue deleted",
        description: "The venue has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete venue",
      });
    },
  });

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: "",
      capacity: 0,
      location: "",
      facilities: "",
      building: "",
      floor: "",
      roomNumber: "",
      isActive: true,
    },
  });

  const filteredVenues = data?.venues.filter(venue => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.facilities?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuilding === "all" || venue.building === selectedBuilding;
    const matchesActiveStatus = showInactive ? true : venue.isActive;
    return matchesSearch && matchesBuilding && matchesActiveStatus;
  });

  const handleAddVenue = () => {
    setEditingVenue(null);
    form.reset({
      name: "",
      capacity: 0,
      location: "",
      facilities: "",
      building: "",
      floor: "",
      roomNumber: "",
      isActive: true,
    });
    setVenueDialogOpen(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    form.reset({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location,
      facilities: venue.facilities || "",
      building: venue.building,
      floor: venue.floor,
      roomNumber: venue.roomNumber,
      isActive: venue.isActive,
    });
    setVenueDialogOpen(true);
  };

  const handleDeleteVenue = (venueId: number) => {
    if (window.confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
      deleteVenueMutation.mutate(venueId);
    }
  };

  const onSubmit = (values: VenueFormValues) => {
    if (editingVenue) {
      updateVenueMutation.mutate({ id: editingVenue.id, values });
    } else {
      createVenueMutation.mutate(values);
    }
  };

  const handleAnalyzeVenue = async (venueId: number) => {
    setAnalyzingVenueId(venueId);
    setIsAnalyzing(true);
    setAnalysisDialogOpen(true);
    
    try {
      const result = await analyzeVenueUsage(venueId);
      if (result.success && result.patterns) {
        setVenueAnalysis(result.patterns);
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: result.message || "Failed to analyze venue usage",
        });
        setVenueAnalysis(null);
      }
    } catch (error) {
      console.error("Error analyzing venue:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "An unexpected error occurred during venue analysis",
      });
      setVenueAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load venues data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Venues - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Manage Venues</h1>
            <Button onClick={handleAddVenue}>
              <span className="material-icons mr-2">add</span>
              Add Venue
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <span className="material-icons">search</span>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search venues..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {data.buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-inactive"
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                  />
                  <label
                    htmlFor="show-inactive"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Show inactive venues
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Venues</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {filteredVenues?.length} venue{filteredVenues?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredVenues?.length ? (
                <div className="py-8 text-center">
                  <span className="material-icons text-4xl text-muted-foreground mb-2">meeting_room</span>
                  <p className="text-muted-foreground">No venues found matching the selected filters.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue) => (
                        <TableRow key={venue.id}>
                          <TableCell className="font-medium">
                            {venue.name}
                            <div className="text-xs text-muted-foreground">
                              {venue.building}, Floor {venue.floor}, Room {venue.roomNumber}
                            </div>
                          </TableCell>
                          <TableCell>{venue.location}</TableCell>
                          <TableCell>{venue.capacity} students</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              venue.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                            }`}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAnalyzeVenue(venue.id)}
                              >
                                <span className="material-icons text-blue-600">analytics</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditVenue(venue)}
                              >
                                <span className="material-icons text-primary">edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVenue(venue.id)}
                                disabled={deleteVenueMutation.isPending}
                              >
                                <span className="material-icons text-destructive">delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Venue Form Dialog */}
        <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingVenue ? "Edit Venue" : "Add New Venue"}</DialogTitle>
              <DialogDescription>
                {editingVenue 
                  ? "Update the venue details below." 
                  : "Fill in the venue details below to add a new venue."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering Block, Room E202" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="building"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building</FormLabel>
                          <FormControl>
                            <Input placeholder="Engineering Block" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Engineering Building" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="roomNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="E202" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseInt(value, 10));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="facilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facilities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Projector, Whiteboard, Air conditioning" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Venue Status</FormLabel>
                          <FormDescription>
                            Active venues can be booked for classes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVenueDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                  >
                    {(createVenueMutation.isPending || updateVenueMutation.isPending) ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                        Saving...
                      </>
                    ) : (
                      editingVenue ? "Update Venue" : "Add Venue"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Venue Analysis Dialog */}
        <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Venue Usage Analysis</DialogTitle>
              <DialogDescription>
                AI-powered analysis of venue usage patterns and conflict resolution suggestions.
              </DialogDescription>
            </DialogHeader>
            
            {isAnalyzing ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing venue usage patterns...</p>
              </div>
            ) : !venueAnalysis ? (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">No analysis data available for this venue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Peak Usage Hours</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {venueAnalysis.peakHours.map((hour: string, index: number) => (
                        <li key={index}>{hour}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Low Usage Hours</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {venueAnalysis.lowUsageHours.map((hour: string, index: number) => (
                        <li key={index}>{hour}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Suggestions for Improvement</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {venueAnalysis.suggestedImprovements.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-md border p-4 bg-yellow-50">
                  <div className="flex items-start">
                    <span className="material-icons text-yellow-600 mr-2">info</span>
                    <div>
                      <h3 className="font-medium mb-1">Conflict Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        This venue has experienced {venueAnalysis.commonConflicts} booking conflicts in the current term.
                        The AI system has successfully resolved these conflicts by finding alternative venues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setAnalysisDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </>
  );
}
