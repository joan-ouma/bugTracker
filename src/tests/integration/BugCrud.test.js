import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BugList from '../../components/BugList';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockBugs = [
    {
        _id: '1',
        title: 'Login page broken',
        description: 'Login page returns 500 error',
        status: 'open',
        priority: 'high',
        bugNumber: 'PROJ-001'
    },
    {
        _id: '2',
        title: 'Mobile responsive issue',
        description: 'Layout breaks on mobile',
        status: 'in-progress',
        priority: 'medium',
        bugNumber: 'PROJ-002'
    }
];

describe('Bug CRUD Integration', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockBugs });
        axios.post.mockResolvedValue({ data: { ...mockBugs[0], _id: '3' } });
        axios.put.mockResolvedValue({ data: { ...mockBugs[0], status: 'resolved' } });
        axios.delete.mockResolvedValue({ data: { message: 'Bug deleted' } });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('loads and displays bugs list', async () => {
        render(
            <BrowserRouter>
                <BugList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login page broken')).toBeInTheDocument();
            expect(screen.getByText('Mobile responsive issue')).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith('/api/bugs');
    });

    test('handles empty bug list', async () => {
        axios.get.mockResolvedValue({ data: [] });

        render(
            <BrowserRouter>
                <BugList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no bugs found/i)).toBeInTheDocument();
        });
    });

    test('handles API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <BugList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/failed to fetch bugs/i)).toBeInTheDocument();
        });
    });
});