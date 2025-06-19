import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
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

  //console.log('Header:', header);

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  const currentCsp = responseHeaders.get('Content-Security-Policy') || '';

  const appendToDirective = (csp, directive, sources) => {
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

  // Pass `updatedCsp` into each call
  updatedCsp = appendToDirective(updatedCsp, 'default-src', [
    `'nonce-${nonce}'`,
    // 'https://unpkg.com',
    // 'https://api.us.elevenlabs.io',
    'https://storage.googleapis.com',
  ]);

  updatedCsp = appendToDirective(updatedCsp, 'script-src', [
    `'nonce-${nonce}'`,
    'https://unpkg.com',
    'http://localhost:*',
    'https://cdn.shopify.com',
    'https://shopify.com',
  ]);

  // updatedCsp = appendToDirective(updatedCsp, 'style-src', [
  //   'https://unpkg.com',
  //   'https://cdn.shopify.com',
  //   'https://shopify.com',
  //   'http://localhost:*',
  //   'https://api.us.elevenlabs.io',
  //   'https://storage.googleapis.com'
  // ]);

  updatedCsp = appendToDirective(updatedCsp, 'connect-src', [
    // `'nonce-${nonce}'`,
    // 'https://unpkg.com',
    'https://api.us.elevenlabs.io',
  ]);

  responseHeaders.set('Content-Security-Policy', updatedCsp);
  console.log('Updated CSP:', updatedCsp);

  //  responseHeaders.set(
  //   'Content-Security-Policy',
  //   [
  //     `default-src 'self' https://cdn.shopify.com https://shopify.com https://unpkg.com https://api.us.elevenlabs.io https://storage.googleapis.com http://localhost:*;`,
  //     `script-src 'self' https://unpkg.com 'nonce-${nonce}';`,
  //     `style-src 'self' https://unpkg.com 'nonce-${nonce}';`
  //   ].join(' ')
  // );

  //console.log('Content-Security-Policy:', responseHeaders.get('Content-Security-Policy'));

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('react-router').EntryContext} EntryContext */
