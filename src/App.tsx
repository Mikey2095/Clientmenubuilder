import { useState, useEffect } from 'react';
import { CustomerView } from './components/CustomerView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { HomePage } from './components/HomePage';
import { getSession, signOut, getBranding } from './utils/api';
import { initializePlaceholders } from './utils/placeholders';
import { Button } from './components/ui/button';
import { Settings, User } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

// Global function to apply color theme across entire site
const applyGlobalColors = (primary: string, secondary: string, accent: string) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--ring', primary);
  root.style.setProperty('--sidebar-primary', primary);
  root.style.setProperty('--sidebar-ring', primary);
  root.style.setProperty('--border', `${primary}33`); // 20% opacity
  root.style.setProperty('--accent', `${primary}22`); // 13% opacity
  root.style.setProperty('--accent-foreground', primary);
  root.style.setProperty('--chart-1', primary);
  root.style.setProperty('--chart-2', accent);
};

export default function App() {
  const [view, setView] = useState<'home' | 'customer' | 'admin' | 'customerPortal'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [accessToken, setAccessToken] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [placeholdersInitialized, setPlaceholdersInitialized] = useState(false);
  const [customerViewKey, setCustomerViewKey] = useState(0);

  // Load branding colors on initial mount - applies to entire site
  useEffect(() => {
    const loadBrandingColors = async () => {
      try {
        const result = await getBranding();
        if (result.branding) {
          const primaryColor = result.branding.primaryColor || '#E91E63';
          const secondaryColor = result.branding.secondaryColor || '#1A237E';
          const accentColor = result.branding.accentColor || '#FF6B35';
          
          // Apply colors immediately to prevent flash
          applyGlobalColors(primaryColor, secondaryColor, accentColor);
          console.log('✓ Global branding colors applied:', { primaryColor, secondaryColor, accentColor });
        }
      } catch (error) {
        console.log('Failed to load branding colors, using defaults:', error);
        // Apply default colors even if fetch fails
        applyGlobalColors('#E91E63', '#1A237E', '#FF6B35');
      }
    };
    
    loadBrandingColors();
  }, []);

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
      setCustomerViewKey(prev => prev + 1); // Force refresh customer view
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const navigateToCustomerView = () => {
    setView('customer');
    setCustomerViewKey(prev => prev + 1); // Force refresh customer view
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
      {view === 'home' ? (
        <HomePage onEnter={navigateToCustomerView} />
      ) : view === 'customer' ? (
        <CustomerView 
          key={customerViewKey}
          onOpenCustomerPortal={() => setView('customerPortal')}
          onOpenAdmin={() => setView('admin')}
          isAdminLoggedIn={isAuthenticated}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {isAuthenticated ? (
            userRole === 'admin' ? (
              <AdminDashboard 
                onLogout={handleLogout} 
                accessToken={accessToken}
                onPreview={navigateToCustomerView}
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
                onClick={navigateToCustomerView}
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