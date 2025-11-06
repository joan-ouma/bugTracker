import React, { useState, useEffect } from 'react';
import CreateProjectBug from './CreateProjectBug';

const Projects = ({ user, onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showBugForm, setShowBugForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        projectKey: '',
        teamMembers: [],
        bugTypes: []
    });
    const [newBugType, setNewBugType] = useState({ name: '', description: '', color: '#6B7280' });

    // Debug logging
    const DEBUG = true;
    const log = (message, data = null) => {
        if (DEBUG) {
            console.log(`📁 [PROJECTS DEBUG] ${message}`, data || '');
        }
    };

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                log('Projects fetched successfully', { count: data.length });
                setProjects(data);
            } else {
                console.error('Failed to fetch projects');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newProject = await response.json();
                console.log('Project created successfully', { project: newProject.name });
                setProjects(prev => [newProject, ...prev]);
                setShowCreateForm(false);
                setFormData({
                    name: '',
                    description: '',
                    projectKey: '',
                    teamMembers: [],
                    bugTypes: []
                });
                setNewBugType({ name: '', description: '', color: '#6B7280' });
            } else {
                const errorData = await response.json();
                console.error('Failed to create project:', errorData);
                alert(errorData.error || errorData.details?.join(', ') || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project: ' + error.message);
        }
    };

    const addBugType = () => {
        if (newBugType.name.trim()) {
            setFormData(prev => ({
                ...prev,
                bugTypes: [...prev.bugTypes, { ...newBugType }]
            }));
            setNewBugType({ name: '', description: '', color: '#6B7280' });
        }
    };

    const removeBugType = (index) => {
        setFormData(prev => ({
            ...prev,
            bugTypes: prev.bugTypes.filter((_, i) => i !== index)
        }));
    };

    const handleViewBugs = (project) => {
        console.log('View Bugs clicked for project:', project);
        console.log('Project ID:', project?._id);
        console.log('Project data:', project);

        if (!project || !project._id) {
            console.error('Invalid project data:', project);
            alert('Error: Project data is invalid');
            return;
        }

        log('Navigating to project bugs', {
            projectId: project._id,
            projectName: project.name
        });

        // Store the project ID safely
        localStorage.setItem('currentProjectId', project._id.toString());
        localStorage.setItem('currentProjectData', JSON.stringify(project));

        if (onNavigate) {
            console.log('Navigating to project-bugs');
            onNavigate('project-bugs');
        } else {
            console.error('onNavigate function is not available');
            alert('Navigation not available. Please refresh the page.');
        }
    };

    // Updated handleCreateBug function to use modal
    const handleCreateBug = (project) => {
        log('Opening bug creation modal for project', { project: project.name });
        setSelectedProject(project);
        setShowBugForm(true);
    };

    // Function to handle when a bug is created
    const handleBugCreated = (newBug) => {
        console.log('New bug created:', newBug);
        // Refresh projects to update bug counts
        fetchProjects();
        // Close the modal
        setShowBugForm(false);
        setSelectedProject(null);
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    log('Project deleted successfully', { projectId });
                    setProjects(prev => prev.filter(project => project._id !== projectId));
                } else {
                    const errorData = await response.json();
                    alert(errorData.error || 'Failed to delete project');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Error deleting project');
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            archived: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            active: '🟢',
            archived: '📁',
            completed: '✅'
        };
        return icons[status] || '📝';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {projects.length} project{projects.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create New Project
                    </button>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateProject} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter project name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Key *
                                        </label>
                                        <input
                                            type="text"
                                            name="projectKey"
                                            value={formData.projectKey}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., WEB, MOB, API"
                                            maxLength={5}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Short code (3-5 characters, uppercase)</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe the project purpose and scope"
                                    />
                                </div>

                                {/* Custom Bug Types Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Custom Bug Types (Optional)
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newBugType.name}
                                                onChange={(e) => setNewBugType(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Bug type name"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <input
                                                type="color"
                                                value={newBugType.color}
                                                onChange={(e) => setNewBugType(prev => ({ ...prev, color: e.target.value }))}
                                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                            />
                                            <button
                                                type="button"
                                                onClick={addBugType}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={newBugType.description}
                                            onChange={(e) => setNewBugType(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Type description (optional)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Added Bug Types */}
                                    {formData.bugTypes.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium text-gray-700">Added Bug Types:</p>
                                            {formData.bugTypes.map((type, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: type.color }}
                                                        ></div>
                                                        <span className="font-medium">{type.name}</span>
                                                        {type.description && (
                                                            <span className="text-sm text-gray-600">- {type.description}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBugType(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {formData.bugTypes.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            If no custom types are specified, default bug types will be used.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Bug Creation Modal */}
            {showBugForm && selectedProject && (
                <CreateProjectBug
                    project={selectedProject}
                    onBugCreated={handleBugCreated}
                    onClose={() => {
                        setShowBugForm(false);
                        setSelectedProject(null);
                    }}
                />
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{getStatusIcon(project.status)}</span>
                                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                    {project.projectKey}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                        {/* Updated Project Information Section */}
                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                            <div className="flex justify-between">
                                <span>Owner:</span>
                                <span className="font-medium">{project.createdBy?.firstName} {project.createdBy?.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Team Members:</span>
                                <span className="font-medium">{project.teamMembers?.length || 0}</span>
                            </div>
                            {/* Custom Bug Types Count */}
                            <div className="flex justify-between">
                                <span>Bug Types Available:</span>
                                <span className="font-medium text-purple-600">
                                    {project.bugTypes?.length || 0}
                                </span>
                            </div>
                            {/* Actual Bug Reports Count */}
                            <div className="flex justify-between">
                                <span>Total Bugs Reported:</span>
                                <span className={`font-medium ${project.bugCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {project.bugCount} bug{project.bugCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Open Bugs:</span>
                                <span className={`font-medium ${project.openBugCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {project.openBugCount} open
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{formatDate(project.createdAt)}</span>
                            </div>
                        </div>

                        {/* Custom Bug Types Preview */}
                        {project.bugTypes && project.bugTypes.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs font-medium text-blue-700 mb-2">
                                    Custom Bug Types:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {project.bugTypes.slice(0, 3).map((type, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 rounded text-xs font-medium"
                                            style={{
                                                backgroundColor: type.color + '20',
                                                color: type.color,
                                                border: `1px solid ${type.color}40`
                                            }}
                                        >
                                            {type.name}
                                        </span>
                                    ))}
                                    {project.bugTypes.length > 3 && (
                                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                            +{project.bugTypes.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleViewBugs(project)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                View Bugs
                            </button>
                            <button
                                onClick={() => handleCreateBug(project)}
                                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                                Report Bug
                            </button>
                            <button
                                onClick={() => handleDeleteProject(project._id)}
                                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Create your first project to start organizing your work and tracking bugs</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Your First Project
                    </button>
                </div>
            )}
        </div>
    );
};

export default Projects;