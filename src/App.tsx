import { useState, useEffect } from 'react';
import { CustomerView } from './components/CustomerView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { getSession, signOut } from './utils/api';
import { initializePlaceholders } from './utils/placeholders';
import { Button } from './components/ui/button';
import { Settings, User } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [view, setView] = useState<'customer' | 'admin' | 'customerPortal'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [accessToken, setAccessToken] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [placeholdersInitialized, setPlaceholdersInitialized] = useState(false);

  useEffect(() => {
    // Check if there's an existing session
    const checkExistingSession = async () => {
      try {
        const { data, error } = await getSession();
        if (data?.session?.access_token) {
          setAccessToken(data.session.access_token);
          setIsAuthenticated(true);
          const role = data.session.user.user_metadata?.role || 'admin';
          setUserRole(role);
          setView('admin');
          
          // Initialize placeholder menu items if needed (only for admins)
          if (role === 'admin' && !placeholdersInitialized) {
            const initialized = await initializePlaceholders(data.session.access_token);
            if (initialized) {
              console.log('Placeholder menu items created');
            }
            setPlaceholdersInitialized(true);
          }
        }
      } catch (error) {
        console.log('Session check error:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [placeholdersInitialized]);

  const handleLogin = async (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    
    // Get user role from session
    const { data } = await getSession();
    const role = data?.session?.user.user_metadata?.role || 'admin';
    setUserRole(role);
    
    // Initialize placeholder menu items on first admin login
    if (role === 'admin' && !placeholdersInitialized) {
      const initialized = await initializePlaceholders(token);
      if (initialized) {
        console.log('Placeholder menu items created');
      }
      setPlaceholdersInitialized(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setAccessToken('');
      setView('customer');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (view === 'customerPortal') {
    return (
      <>
        <CustomerPortal onBack={() => setView('customer')} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {view === 'customer' ? (
        <CustomerView 
          onOpenCustomerPortal={() => setView('customerPortal')}
          onOpenAdmin={() => setView('admin')}
        />
      ) : (
        <>
          {isAuthenticated ? (
            userRole === 'admin' ? (
              <AdminDashboard 
                onLogout={handleLogout} 
                accessToken={accessToken}
                onPreview={() => setView('customer')}
              />
            ) : (
              <StaffDashboard 
                onLogout={handleLogout} 
                accessToken={accessToken}
              />
            )
          ) : (
            <div className="relative">
              <AdminLogin onLogin={handleLogin} />
              <Button
                onClick={() => setView('customer')}
                className="fixed top-4 left-4 z-50"
                size="sm"
                variant="outline"
              >
                ← Back to Menu
              </Button>
            </div>
          )}
        </>
      )}
      <Toaster />
    </>
  );
}