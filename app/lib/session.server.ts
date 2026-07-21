import {createCookieSessionStorage} from '@shopify/remix-oxygen';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: ['your-secret-here'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getCustomerAccessToken(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return session.get('customerAccessToken');
}

export async function setCustomerAccessToken(request: Request, token: string) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  session.set('customerAccessToken', token);
  return sessionStorage.commitSession(session);
}
