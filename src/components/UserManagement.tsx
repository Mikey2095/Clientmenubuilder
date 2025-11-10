import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { createUser, getUsers, updateUser, deleteUser } from '../utils/api';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserManagementProps {
  accessToken: string;
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
    title?: string;
  };
}

export function UserManagement({ accessToken }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    title: 'Cook',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await getUsers(accessToken);
      if (result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      console.log('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createUser(
        newUserData.email,
        newUserData.password,
        newUserData.name,
        newUserData.title,
        accessToken
      );

      if (result.success) {
        toast.success('User created successfully!');
        setCreateDialogOpen(false);
        setNewUserData({ name: '', email: '', password: '', title: 'Cook' });
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.log('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateTitle = async (userId: string, newTitle: string) => {
    try {
      const result = await updateUser(userId, newTitle, accessToken);
      if (result.success) {
        toast.success('User title updated!');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.log('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const result = await deleteUser(userId, accessToken);
      if (result.success) {
        toast.success('User deleted successfully!');
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.log('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  return (
    <div className="max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage staff users who can view orders and menu. Only admins can access this panel.
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new staff member with limited access to orders and menu.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      required
                      placeholder="e.g., Cook, Runner, Cashier"
                      value={newUserData.title}
                      onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create User
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff users yet. Create your first user to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.user_metadata?.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.user_metadata?.role)} variant="secondary">
                        {user.user_metadata?.role === 'admin' ? 'Admin' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingUser?.id === user.id ? (
                        <div className="flex gap-2">
                          <Input
                            defaultValue={user.user_metadata?.title || ''}
                            onBlur={(e) => handleUpdateTitle(user.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateTitle(user.id, e.currentTarget.value);
                              }
                            }}
                            className="h-8"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{user.user_metadata?.title || 'Staff'}</span>
                          {user.user_metadata?.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.user_metadata?.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
