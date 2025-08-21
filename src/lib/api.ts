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

    if (res.status === 204) {
        return { message: 'Success' };
    }

    if (res.headers.has('X-Pagination')) {
      const pagination = JSON.parse(res.headers.get('X-Pagination')!);
      const data = await res.json();
      return { data, ...pagination };
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

export async function getJournal(id: string): Promise<JournalResponse> {
  const journalData = await fetcher(`/journals/${id}`);
  return { data: journalData };
}

type JournalMutationPayload = {
  Title: string;
  Content: string;
  Tags: string[];
  IsPublished: boolean;
};


export async function createJournal(data: JournalMutationPayload): Promise<Journal> {
  return fetcher('/journals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateJournal(id: string, data: JournalMutationPayload): Promise<JournalResponse> {
  const updatedJournal = await fetcher(`/journals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return { data: updatedJournal };
}

export async function deleteJournal(id: string): Promise<{ message: string }> {
  return fetcher(`/journals/${id}`, {
    method: 'DELETE',
  });
}
