import React, { useState, useEffect } from 'react';

const BugForm = ({ onBugCreated, projects = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        priority: 'medium',
        severity: 'minor',
        type: 'bug',
        status: 'open',
        stepsToReproduce: [''],
        expectedBehavior: '',
        actualBehavior: '',
        environment: {
            os: '',
            browser: '',
            device: '',
            version: ''
        },
        attachments: [],
        dueDate: '',
        estimatedHours: '',
        actualHours: '',
        tags: [],
        reporter: 'current-user', //comes from AuthContext
        assignee: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newTag, setNewTag] = useState('');

    // Mock projects data
    const mockProjects = [
        { _id: '1', name: 'Website Redesign', key: 'WEB' },
        { _id: '2', name: 'Mobile App', key: 'MOB' },
        { _id: '3', name: 'API Development', key: 'API' },
        { _id: '4', name: 'Database Optimization', key: 'DB' }
    ];

    // Mock users for assignment
    const mockUsers = [
        { _id: '1', name: 'John Developer', role: 'developer' },
        { _id: '2', name: 'Sarah Tester', role: 'tester' },
        { _id: '3', name: 'Mike Manager', role: 'project_manager' },
        { _id: '4', name: 'Alice Admin', role: 'admin' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEnvironmentChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            environment: {
                ...prev.environment,
                [name]: value
            }
        }));
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...formData.stepsToReproduce];
        newSteps[index] = value;
        setFormData(prev => ({
            ...prev,
            stepsToReproduce: newSteps
        }));
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            stepsToReproduce: [...prev.stepsToReproduce, '']
        }));
    };

    const removeStep = (index) => {
        if (formData.stepsToReproduce.length > 1) {
            const newSteps = formData.stepsToReproduce.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                stepsToReproduce: newSteps
            }));
        }
    };

    const handleTagAdd = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
        }));

        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments]
        }));
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate required fields
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }
            if (!formData.description.trim()) {
                throw new Error('Description is required');
            }
            if (!formData.project) {
                throw new Error('Please select a project');
            }

            // Filter out empty steps
            const filteredSteps = formData.stepsToReproduce.filter(step => step.trim() !== '');

            const submitData = {
                ...formData,
                stepsToReproduce: filteredSteps,
                estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
                actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
                dueDate: formData.dueDate || undefined
            };

            const response = await fetch('http://localhost:5000/api/bugs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create bug');
            }

            const newBug = await response.json();
            onBugCreated(newBug);
            setSuccess('Bug reported successfully!');

            // Reset form
            setFormData({
                title: '',
                description: '',
                project: '',
                priority: 'medium',
                severity: 'minor',
                type: 'bug',
                status: 'open',
                stepsToReproduce: [''],
                expectedBehavior: '',
                actualBehavior: '',
                environment: {
                    os: '',
                    browser: '',
                    device: '',
                    version: ''
                },
                attachments: [],
                dueDate: '',
                estimatedHours: '',
                actualHours: '',
                tags: [],
                reporter: 'current-user',
                assignee: ''
            });

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            project: '',
            priority: 'medium',
            severity: 'minor',
            type: 'bug',
            status: 'open',
            stepsToReproduce: [''],
            expectedBehavior: '',
            actualBehavior: '',
            environment: {
                os: '',
                browser: '',
                device: '',
                version: ''
            },
            attachments: [],
            dueDate: '',
            estimatedHours: '',
            actualHours: '',
            tags: [],
            reporter: 'current-user',
            assignee: ''
        });
        setError('');
        setSuccess('');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Report New Bug</h2>
                    <p className="text-sm text-gray-600 mt-1">Fill in all the details below to report a new bug</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Status Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-800 text-sm">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project *
                                </label>
                                <select
                                    name="project"
                                    value={formData.project}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a project</option>
                                    {mockProjects.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name} ({project.key})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bug Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter a clear and descriptive title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the bug in detail. Include what you were doing when the bug occurred..."
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Classification</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="bug">Bug</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="enhancement">Enhancement</option>
                                        <option value="task">Task</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Severity
                                    </label>
                                    <select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="minor">Minor</option>
                                        <option value="major">Major</option>
                                        <option value="blocker">Blocker</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign To
                                </label>
                                <select
                                    name="assignee"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Unassigned</option>
                                    {mockUsers.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Hours
                                    </label>
                                    <input
                                        type="number"
                                        name="estimatedHours"
                                        value={formData.estimatedHours}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Behavior Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Expected Behavior</h3>
                            <textarea
                                name="expectedBehavior"
                                value={formData.expectedBehavior}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe what should happen when the feature works correctly..."
                            />
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Actual Behavior</h3>
                            <textarea
                                name="actualBehavior"
                                value={formData.actualBehavior}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe what actually happens when the bug occurs..."
                            />
                        </div>
                    </div>

                    {/* Section 3: Steps to Reproduce */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Steps to Reproduce</h3>
                        <div className="space-y-3">
                            {formData.stepsToReproduce.map((step, index) => (
                                <div key={index} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 border border-gray-300 rounded-full text-xs flex items-center justify-center mt-2">
                    {index + 1}
                  </span>
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={`Step ${index + 1} - Describe the action`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        className="flex-shrink-0 px-3 py-2 text-red-600 hover:text-red-800 disabled:text-gray-400 mt-2"
                                        disabled={formData.stepsToReproduce.length === 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addStep}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Another Step
                            </button>
                        </div>
                    </div>

                    {/* Section 4: Environment & Tags */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Environment Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text"
                                    name="os"
                                    value={formData.environment.os}
                                    onChange={handleEnvironmentChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Operating System (e.g., Windows 11, macOS Ventura)"
                                />
                                <input
                                    type="text"
                                    name="browser"
                                    value={formData.environment.browser}
                                    onChange={handleEnvironmentChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Browser (e.g., Chrome 119, Firefox 120)"
                                />
                                <input
                                    type="text"
                                    name="device"
                                    value={formData.environment.device}
                                    onChange={handleEnvironmentChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Device (e.g., iPhone 15, Dell XPS 13)"
                                />
                                <input
                                    type="text"
                                    name="version"
                                    value={formData.environment.version}
                                    onChange={handleEnvironmentChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="App Version (e.g., 2.1.0)"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Tags & Attachments</h3>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add a tag (press Enter)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTagAdd}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                      {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleTagRemove(tag)}
                                                className="hover:text-blue-900"
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attachments
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Click to upload files</span>
                                        <span className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</span>
                                    </label>
                                </div>

                                {/* Attachments list */}
                                {formData.attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {formData.attachments.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-700">{file.name}</span>
                                                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating Bug...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Bug Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BugForm;