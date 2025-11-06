import React from 'react';

const Dashboard = ({ bugs, user, onNavigate }) => {
    // Calculate stats from actual bugs data
    const stats = {
        total: bugs.length,
        open: bugs.filter(bug => bug.status === 'open').length,
        inProgress: bugs.filter(bug => bug.status === 'in-progress').length,
        resolved: bugs.filter(bug => bug.status === 'resolved').length,
        closed: bugs.filter(bug => bug.status === 'closed').length,
    };

    const recentBugs = bugs.slice(0, 5); // Show latest 5 bugs

    const getPriorityColor = (priority) => {
        const colors = {
            critical: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-red-100 text-red-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Debug logging
    const DEBUG = true;
    const log = (message, data = null) => {
        if (DEBUG) {
            console.log(`📊 [DASHBOARD DEBUG] ${message}`, data || '');
        }
    };

    const handleQuickAction = (action) => {
        log('Quick action clicked', { action });
        if (onNavigate) {
            onNavigate(action);
        } else {
            console.error('onNavigate function not provided to Dashboard');
        }
    };

    const handleViewAllBugs = () => {
        log('View all bugs clicked');
        if (onNavigate) {
            onNavigate('bugs');
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section - Personalized */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">Welcome back, {user.firstName}! 👋</h1>
                <p className="text-blue-100 mt-2">
                    {stats.total === 0
                        ? "Ready to track your first bug?"
                        : `You have ${stats.open} open bugs that need attention`
                    }
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🐛</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">⚠️</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🔄</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">✅</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bugs & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bugs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Bugs</h2>
                    </div>
                    <div className="p-6">
                        {recentBugs.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-4xl mb-4">🐛</div>
                                <p className="text-gray-500">No bugs reported yet</p>
                                <p className="text-sm text-gray-400 mt-1">Report your first bug to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentBugs.map((bug) => (
                                    <div key={bug._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm font-mono text-gray-500">{bug.bugNumber}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                          {bug.priority}
                        </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 text-sm">{bug.title}</h3>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(bug.status)}`}>
                          {bug.status}
                        </span>
                                                <span>{formatDate(bug.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {bugs.length > 5 && (
                            <button
                                onClick={handleViewAllBugs}
                                className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                View all bugs →
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleQuickAction('create-bug')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">🐛</span>
                                </div>
                                <span className="mt-3 font-medium text-gray-700">Report Bug</span>
                            </button>

                            <button
                                onClick={() => handleQuickAction('bugs')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <span className="mt-3 font-medium text-gray-700">View All Bugs</span>
                            </button>

                            <button
                                onClick={() => handleQuickAction('projects')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <span className="mt-3 font-medium text-gray-700">Projects</span>
                            </button>

                            <button
                                onClick={() => handleQuickAction('profile')}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">👤</span>
                                </div>
                                <span className="mt-3 font-medium text-gray-700">Your Profile</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;