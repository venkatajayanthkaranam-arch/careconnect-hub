import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AddEmployeeDialog } from './AddEmployeeDialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, RefreshCw, Users, Trash2, UserX, UserCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type EmployeeRole = Database['public']['Enums']['employee_role'];
type Department = Database['public']['Enums']['department'];

interface Employee {
  id: string;
  user_id: string;
  role: EmployeeRole;
  department: Department | null;
  specialization: string | null;
  employee_id: string | null;
  is_active: boolean;
  created_at: string;
  profile?: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteType, setDeleteType] = useState<'temporary' | 'permanent'>('temporary');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles for each employee
      const employeesWithProfiles: Employee[] = [];
      
      for (const role of roles || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', role.user_id)
          .maybeSingle();

        employeesWithProfiles.push({
          ...role,
          profile: profile || undefined,
        });
      }

      setEmployees(employeesWithProfiles);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleActive = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Employee ${employee.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      
      fetchEmployees();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (employee: Employee, type: 'temporary' | 'permanent') => {
    setSelectedEmployee(employee);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    setDeleteLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            userId: selectedEmployee.user_id,
            deleteType: deleteType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      toast({
        title: 'Success',
        description: result.message,
      });

      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadgeClasses = (role: EmployeeRole): string => {
    switch (role) {
      case 'admin': return 'bg-critical/10 text-critical';
      case 'doctor': return 'bg-success/10 text-success';
      case 'nurse': return 'bg-info/10 text-info';
      case 'reception': return 'bg-warning/10 text-warning';
      case 'lab_technician': return 'bg-primary/10 text-primary';
      case 'pharmacist': return 'bg-primary/10 text-primary';
      case 'billing_staff': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDepartment = (dept: Department | null) => {
    if (!dept) return '-';
    return dept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (item: Employee) => (
        <div>
          <p className="font-medium">{item.profile?.name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{item.employee_id || '-'}</p>
        </div>
      )
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (item: Employee) => item.profile?.email || '-'
    },
    { 
      key: 'role', 
      header: 'Role',
      render: (item: Employee) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeClasses(item.role)}`}>
          {item.role.replace(/_/g, ' ')}
        </span>
      )
    },
    { 
      key: 'department', 
      header: 'Department',
      render: (item: Employee) => formatDepartment(item.department)
    },
    { 
      key: 'specialization', 
      header: 'Specialization',
      render: (item: Employee) => item.specialization || '-'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (item: Employee) => (
        <StatusBadge 
          status={item.is_active ? 'active' : 'cancelled'} 
        />
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (item: Employee) => (
        <div className="flex items-center gap-2">
          <Button 
            variant={item.is_active ? 'outline' : 'default'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(item);
            }}
          >
            {item.is_active ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
            {item.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(item, 'temporary');
                }}
                className="text-warning"
              >
                <UserX className="w-4 h-4 mr-2" />
                Temporary Delete (Deactivate)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(item, 'permanent');
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Permanent Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" />
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            Manage hospital staff accounts and roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="medical" onClick={() => setDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="card-elevated">
        <DataTable
          columns={columns}
          data={employees}
          keyField="id"
          emptyMessage={loading ? 'Loading employees...' : 'No employees found'}
        />
      </div>

      <AddEmployeeDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          fetchEmployees();
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === 'permanent' ? 'Permanently Delete Employee?' : 'Temporarily Delete Employee?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'permanent' ? (
                <>
                  <span className="text-destructive font-semibold">Warning: This action cannot be undone!</span>
                  <br /><br />
                  This will permanently remove <strong>{selectedEmployee?.profile?.name || 'this employee'}</strong> ({selectedEmployee?.profile?.email}) from the system. 
                  They will need to be re-registered to access the system again.
                </>
              ) : (
                <>
                  This will deactivate <strong>{selectedEmployee?.profile?.name || 'this employee'}</strong> ({selectedEmployee?.profile?.email}). 
                  They won't be able to log in, but their data will be preserved and they can be reactivated later.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className={deleteType === 'permanent' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {deleteLoading ? 'Processing...' : deleteType === 'permanent' ? 'Delete Permanently' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

