export interface Author {
  id: string;
  name: string;
  designation: string;
  bio: string;
  photoUrl: string;
  linkedinUrl?: string | null;
  isActive: boolean;
}

export async function getAllAuthors(): Promise<Author[]> {
  const response = await fetch('/api/authors');
  if (!response.ok) throw new Error('Failed to fetch authors');
  return response.json();
}

export async function createAuthor(author: Omit<Author, 'id'>): Promise<Author> {
  const response = await fetch('/api/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(author),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to create author');
  return response.json();
}

export async function updateAuthor(id: string, update: Partial<Author>): Promise<Author> {
  const response = await fetch(`/api/authors?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to update author');
  return response.json();
}

export async function deleteAuthor(id: string): Promise<boolean> {
  const response = await fetch(`/api/authors?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete author');
  return response.json().then(data => data.success);
}
