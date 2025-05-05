import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { User } from "@shared/schema";

interface UsersData {
  user: User;
  users: User[];
  departments: string[];
  totalUsers: number;
  studentCount: number;
  lecturerCount: number;
  adminCount: number;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { data, isLoading } = useQuery<UsersData>({
    queryKey: ['/api/admin/users'],
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, {});
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "A password reset email has been sent to the user.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User status updated",
        description: "The user's status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status",
      });
    },
  });

  const filteredUsers = data?.users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleResetPassword = (userId: number) => {
    if (window.confirm("Are you sure you want to reset this user's password?")) {
      resetPasswordMutation.mutate(userId);
    }
  };

  const handleToggleUserStatus = (userId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      toggleUserStatusMutation.mutate({ userId, isActive: newStatus });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
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
          <p className="text-muted-foreground">Failed to load users data</p>
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
        <title>Manage Users - CampusScheduler</title>
      </Helmet>
      <MainLayout user={data.user}>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">User Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary-50 border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="material-icons text-3xl text-primary mr-3">people</span>
                  <div>
                    <p className="text-sm text-primary-800">Total Users</p>
                    <p className="text-2xl font-bold text-primary-900">{data.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="material-icons text-3xl text-blue-500 mr-3">school</span>
                  <div>
                    <p className="text-sm text-blue-800">Students</p>
                    <p className="text-2xl font-bold text-blue-900">{data.studentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="material-icons text-3xl text-green-500 mr-3">person</span>
                  <div>
                    <p className="text-sm text-green-800">Lecturers</p>
                    <p className="text-2xl font-bold text-green-900">{data.lecturerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="material-icons text-3xl text-purple-500 mr-3">admin_panel_settings</span>
                  <div>
                    <p className="text-sm text-purple-800">Admins</p>
                    <p className="text-2xl font-bold text-purple-900">{data.adminCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="lecturer">Lecturers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Users</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {filteredUsers?.length} user{filteredUsers?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredUsers?.length ? (
                <div className="py-8 text-center">
                  <span className="material-icons text-4xl text-muted-foreground mb-2">search_off</span>
                  <p className="text-muted-foreground">No users found matching the selected filters.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : user.role === 'lecturer'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{user.department || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                              >
                                <span className="material-icons text-neutral-600">visibility</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetPassword(user.id)}
                                disabled={resetPasswordMutation.isPending}
                              >
                                <span className="material-icons text-primary">key</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, true)}
                                disabled={toggleUserStatusMutation.isPending}
                              >
                                <span className="material-icons text-red-600">block</span>
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
        
        {/* User Detail Dialog */}
        {selectedUser && (
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected user.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-lg mr-4">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : selectedUser.role === 'lecturer'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>
                </div>
                
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Basic Info</TabsTrigger>
                    <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                    <TabsTrigger value="history">Check-in History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-muted-foreground">{selectedUser.department || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-muted-foreground">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-muted-foreground">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-green-600">Active</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="enrollments" className="py-4">
                    <p className="text-center text-muted-foreground">
                      Enrollment information not available in this preview.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="history" className="py-4">
                    <p className="text-center text-muted-foreground">
                      Check-in history not available in this preview.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetPassword(selectedUser.id)}
                  disabled={resetPasswordMutation.isPending}
                >
                  Reset Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleToggleUserStatus(selectedUser.id, true);
                    setUserDialogOpen(false);
                  }}
                  disabled={toggleUserStatusMutation.isPending}
                >
                  Deactivate User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </MainLayout>
    </>
  );
}
