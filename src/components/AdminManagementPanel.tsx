import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { getAdminCode, saveAdminCode, createAdminUser } from '../utils/api';
import { UserPlus, Key } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AdminManagementPanelProps {
  accessToken: string;
}

export function AdminManagementPanel({ accessToken }: AdminManagementPanelProps) {
  const [adminCode, setAdminCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', profile: 'admin' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminCode();
  }, []);

  const fetchAdminCode = async () => {
    try {
      const result = await getAdminCode(accessToken);
      if (result.code) {
        setAdminCode(result.code);
        setNewCode(result.code);
      }
    } catch (error) {
      console.log('Error fetching admin code:', error);
    }
  };

  const handleSaveCode = async () => {
    setLoading(true);
    try {
      await saveAdminCode(newCode, accessToken);
      setAdminCode(newCode);
      toast.success('Admin code updated successfully!');
    } catch (error) {
      console.log('Error saving code:', error);
      toast.error('Failed to save code');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createAdminUser(
        addUserForm.email,
        addUserForm.password,
        addUserForm.name,
        accessToken
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Admin user created successfully!');
      setDialogOpen(false);
      setAddUserForm({ name: '', email: '', password: '', profile: 'admin' });
    } catch (error) {
      console.log('Error creating admin:', error);
      toast.error('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewCode(code);
  };

  return (
    <div className="space-y-6">
      <h2>Admin Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Admin Verification Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this code with people you want to give admin access. They'll need it to sign up.
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Enter admin code"
                />
                <Button type="button" variant="outline" onClick={generateRandomCode}>
                  Generate
                </Button>
              </div>
            </div>
            {adminCode && adminCode !== newCode && (
              <p className="text-sm text-amber-600">
                Current code: <span className="font-mono">{adminCode}</span>
              </p>
            )}
            <Button onClick={handleSaveCode} disabled={loading || !newCode}>
              {loading ? 'Saving...' : 'Save Code'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Directly create an admin account without requiring a verification code.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Create New Admin
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin User</DialogTitle>
            <DialogDescription>
              Enter the details of the new admin user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                required
                value={addUserForm.name}
                onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                required
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Admin'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}