import React, { useState } from 'react';

const BugForm = ({ onBugCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        severity: 'minor',
        type: 'bug',
        stepsToReproduce: [''],
        expectedBehavior: '',
        actualBehavior: '',
        environment: {
            os: '',
            browser: '',
            device: '',
            version: ''
        },
        dueDate: '',
        estimatedHours: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty steps
            const filteredSteps = formData.stepsToReproduce.filter(step => step.trim() !== '');

            const submitData = {
                ...formData,
                stepsToReproduce: filteredSteps,
                estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
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

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                severity: 'minor',
                type: 'bug',
                stepsToReproduce: [''],
                expectedBehavior: '',
                actualBehavior: '',
                environment: {
                    os: '',
                    browser: '',
                    device: '',
                    version: ''
                },
                dueDate: '',
                estimatedHours: ''
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Report New Bug</h2>
                    <p className="text-sm text-gray-600 mt-1">Fill in the details below to report a new bug</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                placeholder="Enter a descriptive title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bug Type
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
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe the bug in detail..."
                        />
                    </div>

                    {/* Priority and Severity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Steps to Reproduce */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Steps to Reproduce
                        </label>
                        <div className="space-y-2">
                            {formData.stepsToReproduce.map((step, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={`Step ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        className="px-3 py-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
                                        disabled={formData.stepsToReproduce.length === 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addStep}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                + Add Step
                            </button>
                        </div>
                    </div>

                    {/* Behavior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Behavior
                            </label>
                            <textarea
                                name="expectedBehavior"
                                value={formData.expectedBehavior}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="What should happen..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Actual Behavior
                            </label>
                            <textarea
                                name="actualBehavior"
                                value={formData.actualBehavior}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="What actually happens..."
                            />
                        </div>
                    </div>

                    {/* Environment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Environment Details
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="os"
                                value={formData.environment.os}
                                onChange={handleEnvironmentChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Operating System"
                            />
                            <input
                                type="text"
                                name="browser"
                                value={formData.environment.browser}
                                onChange={handleEnvironmentChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Browser"
                            />
                            <input
                                type="text"
                                name="device"
                                value={formData.environment.device}
                                onChange={handleEnvironmentChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Device"
                            />
                            <input
                                type="text"
                                name="version"
                                value={formData.environment.version}
                                onChange={handleEnvironmentChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Version"
                            />
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    title: '',
                                    description: '',
                                    priority: 'medium',
                                    severity: 'minor',
                                    type: 'bug',
                                    stepsToReproduce: [''],
                                    expectedBehavior: '',
                                    actualBehavior: '',
                                    environment: {
                                        os: '',
                                        browser: '',
                                        device: '',
                                        version: ''
                                    },
                                    dueDate: '',
                                    estimatedHours: ''
                                });
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Bug...' : 'Create Bug'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BugForm;