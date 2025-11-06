import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

// Component that throws error
const BuggyComponent = () => {
    throw new Error('Test error');
};

// Mock component
const GoodComponent = () => <div>Good Component</div>;

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Suppress console error for expected error throwing
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('catches errors and displays fallback UI', () => {
        render(
            <ErrorBoundary>
                <BuggyComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('recovers from error when try again is clicked', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <BuggyComponent />
            </ErrorBoundary>
        );

        // Verify error state
        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();

        // Click try again
        fireEvent.click(screen.getByText('Try Again'));

        // Re-render with good component after recovery
        rerender(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Good Component')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
    });

    test('displays error details in development mode', () => {
        // Save original NODE_ENV
        const originalNodeEnv = process.env.NODE_ENV;

        // Set to development
        process.env.NODE_ENV = 'development';

        render(
            <ErrorBoundary>
                <BuggyComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    test('hides error details in production mode', () => {
        // Save original NODE_ENV
        const originalNodeEnv = process.env.NODE_ENV;

        // Set to production
        process.env.NODE_ENV = 'production';

        render(
            <ErrorBoundary>
                <BuggyComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();

        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    test('renders children normally when no error occurs', () => {
        render(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Good Component')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
    });
});