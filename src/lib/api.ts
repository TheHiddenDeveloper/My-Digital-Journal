import type { Journal, JournalsResponse, JournalResponse } from './types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function fetcher(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Using tags for on-demand revalidation. No caching for journal data.
      next: {
        tags: ['journals'],
        revalidate: 0,
      }
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: 'An unknown API error occurred' }));
      console.error('API Error:', res.status, res.statusText, errorBody);
      throw new Error(errorBody.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Network or fetch error:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown network error occurred.');
  }
}

type GetJournalsParams = {
  page?: number;
  pageSize?: number;
  tag?: string;
  search?: string;
};

export async function getJournals(params: GetJournalsParams = {}): Promise<JournalsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params.tag) query.set('tag', params.tag);
  if (params.search) query.set('search', params.search);
  
  const queryString = query.toString();
  return fetcher(`/journals${queryString ? `?${queryString}` : ''}`);
}

export async function getJournal(id: number): Promise<JournalResponse> {
  return fetcher(`/journals/${id}`);
}

export async function createJournal(data: { title: string; content: string; tags: string[] }): Promise<JournalResponse> {
  return fetcher('/journals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateJournal(id: number, data: { title: string; content: string; tags: string[] }): Promise<JournalResponse> {
  return fetcher(`/journals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteJournal(id: number): Promise<{ message: string }> {
  return fetcher(`/journals/${id}`, {
    method: 'DELETE',
  });
}
