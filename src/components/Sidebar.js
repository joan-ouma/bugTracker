import React from 'react';

const Sidebar = ({ activeView, setActiveView, sidebarOpen, setSidebarOpen, user }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'bugs', label: 'All Bugs', icon: '🐛' },
        { id: 'create-bug', label: 'Report Bug', icon: '➕' },
        { id: 'projects', label: 'Projects', icon: '📁' },
        { id: 'profile', label: 'Your Profile', icon: '👤' },
    ];

    const getInitials = () => {
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">BT</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">BugTracker</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                getInitials()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setActiveView(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200
                    ${activeView === item.id
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                  `}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Stats section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-700 font-medium mb-1">Quick Stats</div>
                        <div className="flex justify-between text-xs text-blue-600">
                            <span>Active</span>
                            <span>•</span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;