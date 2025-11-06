import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BugList from './components/BugList';
import BugForm from './components/BugForm';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import ProjectBugs from './components/ProjectBugs';

// Debug mode
const DEBUG = true;

const log = (message, data = null) => {
    if (DEBUG) {
        console.log(`🏠 [APP DEBUG] ${message}`, data || '');
    }
};

const AppContent = () => {
    const { user, loading } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authView, setAuthView] = useState('login');
    const [bugs, setBugs] = useState([]);
    const [bugsLoading, setBugsLoading] = useState(false);

    log('AppContent rendering', {
        user: user ? 'logged in' : 'not logged in',
        loading,
        activeView,
        authView
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        log('Auth state changed', { user: user ? 'exists' : 'null', loading });

        if (!loading && !user) {
            log('No user found, redirecting to auth');
            setActiveView('auth');
        } else if (user) {
            log('User authenticated, showing main app', { user: user.email });
        }
    }, [user, loading]);

    // Fetch bugs when component mounts or when activeView changes to bugs
    useEffect(() => {
        if (activeView === 'bugs' && user) {
            log('Fetching bugs for view', { activeView });
            fetchBugs();
        }
    }, [activeView, user]);
    const fetchBugs = async () => {
        log('Starting bugs fetch');
        setBugsLoading(true);
        try {
            const token = localStorage.getItem('token');
            log('Fetching bugs with token', { tokenLength: token?.length });

            const response = await fetch('http://localhost:5000/api/bugs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            log('Bugs fetch response', { status: response.status, ok: response.ok });

            if (response.ok) {
                const data = await response.json();
                log('Bugs data received', { count: data.length });
                setBugs(data || []);
            } else {
                console.error('Failed to fetch bugs');
                setBugs([]); // Set empty array on error
            }
        } catch (error) {
            console.error('Error fetching bugs:', error);
            setBugs([]); // Set empty array on error
        } finally {
            setBugsLoading(false);
            log('Bugs fetch completed');
        }
    };

    const handleBugCreated = (newBug) => {
        log('New bug created', { bug: newBug });
        setBugs(prevBugs => [newBug, ...prevBugs]);
        setActiveView('bugs');
    };

    const handleBugDeleted = (bugId) => {
        log('Bug deleted', { bugId });
        setBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId));
    };

    const handleBugUpdated = (updatedBug) => {
        log('Bug updated', { bug: updatedBug });
        setBugs(prevBugs =>
            prevBugs.map(bug => bug._id === updatedBug._id ? updatedBug : bug)
        );
    };

    // Handle navigation from dashboard quick actions
    const handleDashboardNavigation = (view) => {
        log('Dashboard navigation requested', { from: 'dashboard', to: view });
        setActiveView(view);
    };

    // Handle successful registration - redirect to login
    const handleRegistrationSuccess = () => {
        log('Registration successful, switching to login view');
        setAuthView('login');
    };

    // Handle view changes
    const handleViewChange = (newView) => {
        log('View changed', { from: activeView, to: newView });
        setActiveView(newView);
    };

    // Show loading state
    if (loading) {
        log('Showing loading state');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading application...</p>
                </div>
            </div>
        );
    }

    // Show authentication pages if not logged in
    if (!user) {
        log('Showing auth view', { authView });
        return authView === 'login' ? (
            <Login
                onSwitchToRegister={() => {
                    log('Switching to register view');
                    setAuthView('register');
                }}
            />
        ) : (
            <Register
                onSwitchToLogin={() => {
                    log('Switching to login view');
                    setAuthView('login');
                }}
                onRegistrationSuccess={handleRegistrationSuccess}
            />
        );
    }

    const renderContent = () => {
        log('Rendering content for view', { activeView });

        switch (activeView) {
            case 'dashboard':
                return (
                    <Dashboard
                        bugs={bugs}
                        user={user}
                        onNavigate={handleDashboardNavigation}
                    />
                );
            case 'bugs':
                return (
                    <BugList
                        bugs={bugs}
                        loading={bugsLoading}
                        onBugDeleted={handleBugDeleted}
                        onBugUpdated={handleBugUpdated}
                        onRefresh={fetchBugs}
                        user={user}
                    />
                );
            case 'create-bug':
                return <BugForm onBugCreated={handleBugCreated} user={user} />;
            case 'projects':
                return <Projects user={user} onNavigate={handleViewChange} />;
            case 'project-bugs':
                return <ProjectBugs user={user} onNavigate={handleViewChange} />;
            case 'profile':
                return <UserProfile user={user} />;

            default:
                log('Unknown view, defaulting to dashboard', { activeView });
                return (
                    <Dashboard
                        bugs={bugs}
                        user={user}
                        onNavigate={handleDashboardNavigation}
                    />
                );
        }
    };

    log('Rendering main app layout', { activeView, sidebarOpen });

    return (
        <div className="flex h-screen bg-gray-50">
            <ErrorBoundary>
                {/* Sidebar */}
                <Sidebar
                    activeView={activeView}
                    setActiveView={handleViewChange}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        onSearch={() => handleViewChange('bugs')}
                        user={user}
                        setActiveView={handleViewChange}
                    />

                    <main className="flex-1 overflow-auto p-6">
                        {renderContent()}
                    </main>
                </div>
            </ErrorBoundary>
        </div>
    );
};

function App() {
    log('App component mounted');

    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;