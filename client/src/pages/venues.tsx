import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Venue {
  id: number;
  name: string;
  capacity: number;
  location: string;
  building: string;
  floor: string;
  roomNumber: string;
  facilities: string;
}

interface VenuesPageData {
  user: any;
  venues: Venue[];
  buildings: string[];
}

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  
  const { data, isLoading } = useQuery<VenuesPageData>({
    queryKey: ['/api/venues'],
  });

  const filteredVenues = data?.venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         venue.facilities?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuilding === "all" || venue.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

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
        <title>Venues - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Campus Venues</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <span className="material-icons">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search venues by name or facilities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={selectedBuilding}
              onValueChange={setSelectedBuilding}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
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
          </div>
          
          <Tabs defaultValue="grid" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-muted-foreground">
                {filteredVenues?.length} venue{filteredVenues?.length !== 1 ? "s" : ""} found
              </div>
            </div>
            
            <TabsContent value="grid">
              {filteredVenues?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-4xl text-muted-foreground mb-2">search_off</span>
                    <p>No venues found matching your search criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => { setSearchQuery(""); setSelectedBuilding("all"); }}
                    >
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVenues?.map((venue) => (
                    <Card key={venue.id} className="overflow-hidden">
                      <CardHeader className="py-3 px-4 bg-primary/5 border-b">
                        <CardTitle className="text-base font-medium">{venue.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start text-sm">
                            <span className="font-medium">Location:</span>
                            <span className="text-right">{venue.location}</span>
                          </div>
                          <div className="flex justify-between items-start text-sm">
                            <span className="font-medium">Capacity:</span>
                            <span>{venue.capacity} students</span>
                          </div>
                          <div className="flex justify-between items-start text-sm">
                            <span className="font-medium">Room:</span>
                            <span>Floor {venue.floor}, {venue.roomNumber}</span>
                          </div>
                          <div className="text-sm pt-2 border-t">
                            <span className="font-medium">Facilities:</span>
                            <p className="text-muted-foreground mt-1">{venue.facilities || "No facilities information"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-w-16 aspect-h-9 bg-neutral-100 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="material-icons text-4xl text-muted-foreground mb-2">map</span>
                      <h3 className="text-lg font-medium text-foreground mb-2">Campus Map</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Interactive campus map is currently under development. Check back soon to see venue locations on the map.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
}
