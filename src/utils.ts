import azure from '@azure/functions';
import { AnyRouter, inferRouterContext } from '@trpc/server/src/core';
import { TRPCError } from '@trpc/server/src/error/TRPCError';
import {
  // HTTPRequest,
  HTTPResponse,
  ResponseMetaFn,
} from '@trpc/server/src/http/internals/types';
import { HTTPRequest } from '@trpc/server/src/http/types';
import { OnErrorFunction } from '@trpc/server/src/internals/types';

export function funcTriggerToHTTPRequest(req: azure.HttpRequest): HTTPRequest {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value !== 'undefined') {
      query.append(key, value);
    }
  }

  return {
    method: req.method || 'get',
    query: query,
    headers: req.headers,
    body: req.bufferBody,
  };
}

export function urlToPath(url: string): string {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split('/');
  const trpcPath = pathParts[pathParts.length - 1];

  if (trpcPath === undefined) {
    // should not happen if the function is setup correctly.
    throw new TRPCError({
      message: `Missing path in url "${trpcPath}"`,
      code: 'BAD_REQUEST',
    });
  } else {
    return trpcPath;
  }
}

export type CreateAzureFuncContextOptions = {
  context: azure.Context;
  req: azure.HttpRequest;
};

export type AzureFuncCreateContextFn<TRouter extends AnyRouter> = ({
  req,
  context,
}: CreateAzureFuncContextOptions) =>
  | inferRouterContext<TRouter>
  | Promise<inferRouterContext<TRouter>>;

export type AzureFunctionOptions<TRouter extends AnyRouter> = {
  router: TRouter;
  batching?: {
    enabled: boolean;
  };
  onError?: OnErrorFunction<TRouter, azure.HttpRequest>;
  responseMeta?: ResponseMetaFn<TRouter>;
  createContext?: AzureFuncCreateContextFn<TRouter>;
};

export function tRPCOutputToAzureFuncOutput(
  response: HTTPResponse,
): Record<string, any> {
  return {
    body: response.body ?? undefined,
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...(response.headers ?? {}),
    },
  };
}
