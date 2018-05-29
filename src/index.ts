import { createError, json } from "micro";
import { connect } from "mongoose";
import { parse } from "url";
import * as Pattern from "url-pattern";
import {
  SlothkingEndpoint,
  SlothkingEndpoints,
  SlothkingHandler,
  SlothkingMiddlewareHandler,
  SlothkingMiddlewares,
  SlothkingRunner
} from "./types";
export * from "./types";
import * as qs from "query-string";
let connectedToDatabase = false;

const pathParser = (endpoints: SlothkingEndpoints, path: string) => {
  let endpointName = Object.keys(endpoints).find(k => {
    return new Pattern(`/${endpoints[k].path}`).match(path);
  });
  if (!endpointName) {
    throw createError(404, "Not found");
  }
  let e = endpoints[endpointName];
  if (!e.run) {
    throw createError(
      503,
      `Not implememented please implement this endpoint: ${endpointName}`
    );
  }
  return e;
};

const middlewareParser = (
  e: SlothkingEndpoint,
  middlewares: SlothkingMiddlewares,
  run: SlothkingHandler
) => {
  if (e.middlewares) {
    let endpointMiddlewares = [...e.middlewares];
    endpointMiddlewares.reverse();
    return endpointMiddlewares
      .map(m => {
        let middleware = middlewares[m];
        if (!middleware.run) {
          throw createError(
            503,
            `Not implememented please implement this middleware: ${m}`
          );
        }
        return middleware.run;
      })
      .reduce(
        (a: SlothkingHandler, b: SlothkingMiddlewareHandler) => b(a),
        run
      );
  }
  return run;
};
const run: SlothkingRunner = (extensions, databaseURL) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (!connectedToDatabase && databaseURL) {
    connect(databaseURL);
    connectedToDatabase = true;
  }
  let pathEndpoints = extensions
    .map(e => {
      let newEndpoints: SlothkingEndpoints = {};
      return Object.keys(e.endpoints)
        .map(ek => {
          let endpoint = e.endpoints[ek];
          return {
            ...endpoint,
            key: ek,
            path: `${e.name}/${endpoint.path}`
          };
        })
        .reduce((a, b) => {
          a[b.key] = {
            path: b.path,
            middlewares: b.middlewares,
            run: b.run
          };
          return a;
        }, newEndpoints);
    })
    .reduce((a, b) => ({ ...a, ...b }));
  const parsedURL = parse(req.url);
  let e = pathParser(pathEndpoints, parsedURL.pathname);
  let context = {
    arguments: {}
  };
  if (parsedURL.query) {
    context.arguments = {
      ...qs.parse(parsedURL.query)
    };
  }
  if (req.headers["content-type"] === "application/json") {
    context.arguments = {
      ...context.arguments,
      ...(await json(req))
    };
  }
  const response = await middlewareParser(
    e,
    extensions.reduce((a, b) => {
      a = { ...a, ...b.middlewares };
      return a;
    }, {}),
    e.run
  )({ req, res, context });
  return response;
};

export default run;
