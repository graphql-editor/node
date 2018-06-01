import { IncomingMessage, ServerResponse } from "http";

export type SlothkingArgs<ARGS = {}, CONTEXT = {}> = {
  req: IncomingMessage;
  res: ServerResponse;
  context?: {
    arguments: {
      [x: string]: any;
    } & ARGS;
    [x: string]: any;
  } & CONTEXT;
};

export type SlothkingHandler<ARGS = {}, CONTEXT = {}, RETURN = any> = (
  props: SlothkingArgs<ARGS, CONTEXT>
) => Promise<RETURN>;
export type SlothkingMiddlewareHandler<ARGS = {}, CONTEXT = {}> = (
  fn: SlothkingHandler<ARGS, CONTEXT>
) => SlothkingHandler<ARGS, CONTEXT>;
export type SlothkingEndpoint<ARGS = {}, CONTEXT = {}, RETURN = any> = {
  path: string;
  run?: SlothkingHandler<ARGS, CONTEXT, RETURN>;
  middlewares?: Array<string>;
};
export type SlothkingEndpoints = {
  [x: string]: SlothkingEndpoint;
};
export type SlothkingMiddleware<ARGS = {}, CONTEXT = {}> = {
  name: string;
  run?: SlothkingMiddlewareHandler<ARGS, CONTEXT>;
  context?: any;
};
export type SlothkingMiddlewares = {
  [x: string]: SlothkingMiddleware;
};
export type SlothkingExtension = {
  endpoints: {
    [x: string]: SlothkingEndpoint;
  };
  middlewares?: {
    [x: string]: SlothkingMiddleware;
  };
  name: string;
};
export type SlothkingRunner = (
  extensions: Array<SlothkingExtension>,
  databaseURL?: string
) => (req: IncomingMessage, res: ServerResponse) => Promise<any>;
