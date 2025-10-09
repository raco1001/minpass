import { api } from './base';

export type LoginDto = { email: string; password: string };
export type AuthUser = { id: string; email: string; name?: string; roles?: string[] };

export async function login(dto: LoginDto): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', dto);
  return data.user;
};

export async function me(): Promise<AuthUser> {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {});
};
