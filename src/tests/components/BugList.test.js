import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BugList from '../../components/BugList';

// Mock the useBugs hook or API calls
jest.mock('../../hooks/useBugs', () => ({
    __esModule: true,
    default: () => ({
        bugs: [],
        loading: false,
        error: null,
        deleteBug: jest.fn(),
        updateBug: jest.fn()
    })
}));

describe('BugList Component States', () => {
    test('renders loading state', () => {
        // Mock loading state
        jest.doMock('../../hooks/useBugs', () => ({
            __esModule: true,
            default: () => ({
                bugs: [],
                loading: true,
                error: null
            })
        }));

        const { BugList: BugListComponent } = require('../../components/BugList');
        render(<BugListComponent />);

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders empty state', () => {
        render(<BugList />);

        expect(screen.getByText(/no bugs found/i)).toBeInTheDocument();
        expect(screen.getByText(/start by reporting a new bug/i)).toBeInTheDocument();
    });

    test('renders error state', () => {
        // Mock error state
        jest.doMock('../../hooks/useBugs', () => ({
            __esModule: true,
            default: () => ({
                bugs: [],
                loading: false,
                error: 'Failed to fetch bugs'
            })
        }));

        const { BugList: BugListComponent } = require('../../components/BugList');
        render(<BugListComponent />);

        expect(screen.getByText(/failed to fetch bugs/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('renders bugs list correctly', () => {
        const mockBugs = [
            {
                _id: '1',
                title: 'Test Bug 1',
                status: 'open',
                priority: 'high',
                bugNumber: 'PROJ-001'
            }
        ];

        // Mock successful state
        jest.doMock('../../hooks/useBugs', () => ({
            __esModule: true,
            default: () => ({
                bugs: mockBugs,
                loading: false,
                error: null
            })
        }));

        const { BugList: BugListComponent } = require('../../components/BugList');
        render(<BugListComponent />);

        expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
        expect(screen.getByText('PROJ-001')).toBeInTheDocument();
    });
});