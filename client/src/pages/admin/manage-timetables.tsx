import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import TimetableUploadModal from "@/components/modals/TimetableUploadModal";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TimetableEntry {
  id: number;
  department: string;
  term: string;
  uploadedBy: string;
  uploadDate: string;
  fileName: string;
  status: string;
  conflictsResolved: number;
}

interface TimetablesData {
  user: any;
  timetables: TimetableEntry[];
  departments: string[];
  terms: string[];
}

export default function ManageTimetablesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  
  const { data, isLoading } = useQuery<TimetablesData>({
    queryKey: ['/api/admin/timetables'],
  });

  const deleteTimetableMutation = useMutation({
    mutationFn: async (timetableId: number) => {
      await apiRequest("DELETE", `/api/admin/timetables/${timetableId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timetables'] });
      toast({
        title: "Timetable deleted",
        description: "The timetable has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete timetable",
      });
    },
  });

  const filteredTimetables = data?.timetables.filter(timetable => {
    const matchesSearch = 
      timetable.department.toLowerCase().includes(searchQuery.toLowerCase()) || 
      timetable.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timetable.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || timetable.department === selectedDepartment;
    const matchesTerm = selectedTerm === "all" || timetable.term === selectedTerm;
    return matchesSearch && matchesDepartment && matchesTerm;
  });

  const getStatusBadge = (status: string) => {
    const getClasses = () => {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'processing':
          return 'bg-blue-100 text-blue-800';
        case 'error':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-neutral-100 text-neutral-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClasses()}`}>
        {status}
      </span>
    );
  };

  const handleDeleteTimetable = (id: number) => {
    if (window.confirm("Are you sure you want to delete this timetable? This action cannot be undone.")) {
      deleteTimetableMutation.mutate(id);
    }
  };

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/timetables'] });
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
          <p className="text-muted-foreground">Failed to load timetables data</p>
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
        <title>Manage Timetables - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Manage Timetables</h1>
            <Button onClick={() => setUploadModalOpen(true)}>
              <span className="material-icons mr-2">upload_file</span>
              Upload Timetable
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <span className="material-icons">search</span>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search timetables..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {data.departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedTerm}
                  onValueChange={setSelectedTerm}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    {data.terms.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Timetables</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {filteredTimetables?.length} timetable{filteredTimetables?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredTimetables?.length ? (
                <div className="py-8 text-center">
                  <span className="material-icons text-4xl text-muted-foreground mb-2">calendar_today</span>
                  <p className="text-muted-foreground">No timetables found matching the selected filters.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Conflicts Resolved</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimetables.map((timetable) => (
                        <TableRow key={timetable.id}>
                          <TableCell className="font-medium">{timetable.department}</TableCell>
                          <TableCell>{timetable.term}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{timetable.fileName}</TableCell>
                          <TableCell>{new Date(timetable.uploadDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(timetable.status)}</TableCell>
                          <TableCell className="text-center">
                            {timetable.conflictsResolved > 0 ? (
                              <Badge variant="secondary">{timetable.conflictsResolved}</Badge>
                            ) : (
                              "0"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <span className="material-icons text-primary">edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteTimetable(timetable.id)}
                                disabled={deleteTimetableMutation.isPending}
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
        
        <TimetableUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onSuccess={handleUploadSuccess}
        />
      </MainLayout>
    </>
  );
}

function Badge({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive"; 
}) {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    destructive: "bg-destructive/10 text-destructive"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
