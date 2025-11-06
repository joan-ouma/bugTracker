import React, { useState, useEffect } from 'react';

const ProjectBugs = ({ user, onNavigate }) => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const storedProject = localStorage.getItem('currentProjectData');
        console.log('Retrieved from localStorage:', storedProject);

        if (storedProject) {
            try {
                const projectData = JSON.parse(storedProject);
                console.log('Parsed project data:', projectData);
                setProject(projectData);
                fetchBugs(projectData._id);
            } catch (error) {
                console.error('Error parsing project data:', error);
            }
        }
    }, []);

    const fetchBugs = async (projectId) => {
        console.log('Fetching bugs for project:', projectId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}/bugs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Project bugs API response:', data);

                let bugsArray = [];

                if (Array.isArray(data)) {
                    bugsArray = data;
                } else if (data && Array.isArray(data.bugs)) {
                    bugsArray = data.bugs;
                } else if (data && data.data && Array.isArray(data.data)) {
                    bugsArray = data.data;
                } else {
                    console.warn('Unexpected API response format:', data);
                    bugsArray = [];
                }

                console.log('Processed bugs array:', bugsArray);
                setBugs(bugsArray);
            } else {
                console.error('Failed to fetch bugs');
                setBugs([]);
            }
        } catch (error) {
            console.error('Error fetching bugs:', error);
            setBugs([]);
        } finally {
            setLoading(false);
        }
    };

    // Simple navigation using the onNavigate prop
    const handleBackToProjects = () => {
        console.log('Back to Projects clicked');
        if (onNavigate) {
            onNavigate('projects');
        }
    };

    const handleReportNewBug = () => {
        console.log('Report New Bug clicked');
        if (onNavigate) {
            onNavigate('create-bug');
        }
    };

    const handleReportFirstBug = () => {
        console.log('Report First Bug clicked');
        if (onNavigate) {
            onNavigate('create-bug');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
                <p className="text-gray-600 mb-4">Unable to load project data.</p>
                <button
                    onClick={handleBackToProjects}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    const safeBugs = Array.isArray(bugs) ? bugs : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{project.name} - Bugs</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Project Key: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{project.projectKey}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {safeBugs.length} bug{safeBugs.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleBackToProjects}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            ← Back to Projects
                        </button>
                        <button
                            onClick={handleReportNewBug}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Report New Bug
                        </button>
                    </div>
                </div>
            </div>

            {/* Bugs List */}
            {safeBugs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🐛</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bugs Found</h3>
                    <p className="text-gray-600 mb-4">No bugs have been reported for this project yet.</p>
                    <button
                        onClick={handleReportFirstBug}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Report First Bug
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {safeBugs.map((bug) => (
                        <div key={bug._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{bug.title}</h3>
                                    <p className="text-gray-600 mt-2">{bug.description}</p>
                                    <div className="flex items-center space-x-4 mt-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            bug.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                bug.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                        }`}>
                                            {bug.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            bug.status === 'open' ? 'bg-green-100 text-green-800' :
                                                bug.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                            {bug.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectBugs;