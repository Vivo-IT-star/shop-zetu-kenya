import type {AppLoadContext} from '@shopify/remix-oxygen';
import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  const currentCsp = responseHeaders.get('Content-Security-Policy') || '';

  const appendToDirective = (
    csp: string,
    directive: string,
    sources: any[],
  ) => {
    const regex = new RegExp(`(${directive} [^;]*)`);
    const match = csp.match(regex);

    if (match) {
      const existingSources = match[1];
      const updatedSources = [
        ...new Set([...existingSources.split(' '), ...sources]),
      ].join(' ');
      return csp.replace(existingSources, updatedSources);
    } else {
      return `${csp}; ${directive} ${sources.join(' ')}`;
    }
  };
  let updatedCsp = currentCsp;
  // const hydrogenDomain = new URL(context.env.PUBLIC_STORE_DOMAIN || '').origin;

  // Pass `updatedCsp` into each call
  updatedCsp = appendToDirective(updatedCsp, 'default-src', [
    `'nonce-${nonce}'`,
    // 'https://unpkg.com',
    // 'https://api.us.elevenlabs.io',
    'https://storage.googleapis.com',
    'https://via.placeholder.com',
    'https://assets.gorgias.chat',
    'https://config.gorgias.io',
    'https://us-east1-898b.gorgias.chat',
    'https://storage.googleapis.com',
    'https://www.google.com',
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'script-src', [
    `'nonce-${nonce}'`,
     `'unsafe-eval'`,
    'https://unpkg.com',
    'http://localhost:*',
    'https://cdn.shopify.com',
    'https://shopify.com',
    'data:',
    'https://a.klaviyo.com',
    'https://static-tracking.klaviyo.com',
    'https://bundle.5gtb.com',
    'https://config.gorgias.chat',
    'https://assets.gorgias.chat',
    'https://config.gorgias.io',
    'https://us-east1-898b.gorgias.chat',
    'https://storage.googleapis.com',
    'https://www.google.com',
    'https://connect.facebook.net',
    'https://sz-admin-api.vercel.app',
    'https://www.googletagmanager.com',
    'https://cache.judge.me',
    'https://cdnwidget.judge.me',
    'https://cdn.judge.me/',
    'https://missfittech.com/v1/widget.js',
    'https://www.clarity.ms/tag/sr3t3pysqf',
    'https://scripts.clarity.ms/0.8.65/clarity.js'

    
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'style-src', [
    'https://unpkg.com',
    'https://cdn.shopify.com',
    'https://shopify.com',
    'http://localhost:*',
    'https://api.us.elevenlabs.io',
    'https://storage.googleapis.com',
    'https://fonts.googleapis.com',
    'unsafe-inline',
    'https://a.klaviyo.com',
    'https://www.googletagmanager.com',
    'https://cdnwidget.judge.me',
  ]);

   updatedCsp = appendToDirective(updatedCsp, 'frame-src', [
    'https://judge.me',
     'https://cdnwidget.judge.me',
     'https://missfittech.com/'
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'img-src', [
  'https://www.klaviyo.com',
  'https://static.klaviyo.com',
  'https://a.klaviyo.com',
  'https://unpkg.com',
  'http://localhost:*',
  'https://cdn.shopify.com',
  'https://shopify.com',
  'https://d3k81ch9hvuctc.cloudfront.net',
  'https://cdnjs.cloudflare.com',
  'data:',
  'https://01k0agf27xrcpap76vv02x2nez-8d91754fc2c0d7125add.myshopify.dev',
  'https://assets.gorgias.chat',
  'https://www.facebook.com',
  'https://via.placeholder.com', // GA4
  'https://www.google.co.ke', // GA4
  'https://www.googletagmanager.com/td',
  'https://www.googletagmanager.com/a',
  'https://fonts.gstatic.com',
  'https://cdn.judge.me',
  'https://cache.judge.me',
  'https://judgeme.imgix.net'

  


  // ...other allowed sources
]);

  updatedCsp = appendToDirective(updatedCsp, 'connect-src', [
    // `'nonce-${nonce}'`,
    // 'https://unpkg.com',
    'https://api.us.elevenlabs.io',
    'wss://api.us.elevenlabs.io',
    'https://static.klaviyo.com',
    'https://static-tracking.klaviyo.com',
    'https://static-forms.klaviyo.com',
    'https://fast.a.klaviyo.com',
    'https://a.klaviyo.com',
    'https://b.klaviyo.com',
    'https://api-js.datadome.co',
    'https://assets.gorgias.chat',
    'https://config.gorgias.chat',
    'https://gorgias-convert.com',
    'https://www.facebook.com',
    'https://sz-admin-api.vercel.app',
    'https://analytics.google.com',
    'https://stats.g.doubleclick.net',
    'https://www.google-analytics.com/g/collect',
    'https://www.googletagmanager.com',
    'https://automate.shopzetu.com',
    'https://cache.judge.me/',
    'https://tracking.aws.judge.me',
  'https://cdn.judge.me',
  'https://api.judge.me',
  'https://y.clarity.ms/collect'
  
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'font-src', [
  'https://fonts.gstatic.com',
  'https://cdn.shopify.com',
  'data:',
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'media-src', [
  'blob:',
  'self',
  'http://localhost:3000',  // add this for dev
  'https://www.shopzetu.com',
  'https://storage.googleapis.com',
  'https://cdn.shopify.com',
]);




  responseHeaders.set('Content-Security-Policy', updatedCsp);
  // console.log('Updated CSP:', updatedCsp);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
