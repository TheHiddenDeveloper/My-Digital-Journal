import type { Journal, JournalsResponse } from './types';

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
        tags: options.next?.tags ? ['journals', ...options.next.tags] : ['journals'],
        ...options.next,
      }
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: 'An unknown API error occurred' }));
      console.error('API Error:', res.status, res.statusText, errorBody);
      throw new Error(errorBody.message || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) {
      return null;
    }

    return res;
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
  const res = await fetcher(`/journals${queryString ? `?${queryString}` : ''}`);

  if (!res) return { data: [], totalPages: 0 };
  
  const data = await res.json();
  const pagination = res.headers.has('X-Pagination') ? JSON.parse(res.headers.get('X-Pagination')!) : {};
  
  return { 
    data,
    totalPages: pagination.TotalPages || 1,
  };
}

export async function getJournal(id: string): Promise<Journal | null> {
  const res = await fetcher(`/journals/${id}`, { next: { tags: [`journals:${id}`] }});
  if (!res) return null;
  return res.json();
}

type JournalMutationPayload = {
  Title: string;
  Content: string;
  Tags: string[];
  IsPublished: boolean;
};

export async function createJournal(data: JournalMutationPayload): Promise<Journal> {
  const res = await fetcher('/journals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res!.json();
}

export async function updateJournal(id: string, data: JournalMutationPayload): Promise<Journal> {
  const res = await fetcher(`/journals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res!.json();
}

export async function deleteJournal(id: string): Promise<void> {
  await fetcher(`/journals/${id}`, {
    method: 'DELETE',
  });
}
