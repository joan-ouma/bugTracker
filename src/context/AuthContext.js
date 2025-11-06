import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Debug mode - set to true to see all debug messages
    const DEBUG = true;

    const log = (message, data = null) => {
        if (DEBUG) {
            console.log(`🔧 [AUTH DEBUG] ${message}`, data || '');
        }
    };

    const logError = (message, error = null) => {
        if (DEBUG) {
            console.error(`❌ [AUTH ERROR] ${message}`, error || '');
        }
    };

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            log('Checking authentication status...');

            if (token) {
                log('Token found in localStorage, validating...', { tokenLength: token.length });
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    log('Auth check response received', { status: response.status, ok: response.ok });

                    if (response.ok) {
                        const data = await response.json();
                        log('User data fetched successfully', { user: data.user });
                        setUser(data.user);
                    } else {
                        log('Auth check failed, removing invalid token');
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    logError('Auth check failed with error', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } else {
                log('No token found in localStorage');
            }
            setLoading(false);
            log('Auth check completed', { user: user ? 'logged in' : 'not logged in' });
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        log('Login attempt started', { email });

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            log('Login response received', { status: response.status, ok: response.ok });

            const data = await response.json();

            if (!response.ok) {
                logError('Login failed', data);
                throw new Error(data.error || 'Login failed');
            }

            log('Login successful', { user: data.user, tokenLength: data.token?.length });

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);

            log('User state updated and token stored');

            return { success: true, data };
        } catch (error) {
            logError('Login error', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        log('Registration attempt started', { email: userData.email, username: userData.username });

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            log('Registration response received', { status: response.status, ok: response.ok });

            const data = await response.json();

            if (!response.ok) {
                logError('Registration failed', data);
                throw new Error(data.error || 'Registration failed');
            }

            log('Registration successful', { user: data.user, tokenLength: data.token?.length });

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);

            return { success: true, data };
        } catch (error) {
            logError('Registration error', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        log('Logout initiated', { user: user?.email });
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        log('Logout completed - token removed and user state cleared');
    };

    const updateProfile = async (profileData) => {
        log('Profile update attempt', profileData);

        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            log('Profile update response', { status: response.status, ok: response.ok });

            const data = await response.json();

            if (!response.ok) {
                logError('Profile update failed', data);
                throw new Error(data.error || 'Profile update failed');
            }

            log('Profile update successful', { user: data.user });
            setUser(data.user);
            return { success: true, data };
        } catch (error) {
            logError('Profile update error', error);
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (passwordData) => {
        log('Password change attempt');

        try {
            const response = await fetch('http://localhost:5000/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData),
            });

            log('Password change response', { status: response.status, ok: response.ok });

            const data = await response.json();

            if (!response.ok) {
                logError('Password change failed', data);
                throw new Error(data.error || 'Password change failed');
            }

            log('Password change successful');
            return { success: true, data };
        } catch (error) {
            logError('Password change error', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        token,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
    };

    log('AuthProvider rendering', { user: user ? 'logged in' : 'not logged in', loading });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};