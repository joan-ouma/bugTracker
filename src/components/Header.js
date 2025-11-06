import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen, onSearch, user, setActiveView }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { logout } = useAuth();

    // Debug logging
    const DEBUG = true;
    const log = (message, data = null) => {
        if (DEBUG) {
            console.log(`👤 [HEADER DEBUG] ${message}`, data || '');
        }
    };

    const getInitials = () => {
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    };

    const handleProfileClick = () => {
        log('Profile clicked from header');
        setActiveView('profile');
        setUserMenuOpen(false);
    };

    const handleLogout = () => {
        log('Logout initiated from header');
        logout();
        setUserMenuOpen(false);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        log('Search query changed', { query });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            log('Global search submitted', { query: searchQuery });

            // Navigate to bugs page with search query
            setActiveView('bugs');

            // Store the search query for the BugList component to use
            localStorage.setItem('globalSearchQuery', searchQuery);

            // alert(`Searching for: "${searchQuery}" - Redirecting to bugs page`);

        } else {
            log('Empty search query, focusing bugs page');
            setActiveView('bugs');
        }

        // Clear search after submission
        setSearchQuery('');
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => {
                        log('Mobile menu toggled', { newState: !sidebarOpen });
                        setSidebarOpen(!sidebarOpen);
                    }}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Global Search Bar */}
                <div className="flex-1 max-w-2xl mx-auto">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchKeyPress}
                            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search bugs, projects, users..."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                                type="submit"
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Search"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>

                {/* User menu */}
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button
                            onClick={() => {
                                log('User menu toggled', { newState: !userMenuOpen });
                                setUserMenuOpen(!userMenuOpen);
                            }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                                ) : (
                                    getInitials()
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-700">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* User dropdown menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                                <button
                                    onClick={handleProfileClick}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Your Profile
                                </button>
                                <div className="border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;