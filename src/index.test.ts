import run, { SlothkingEndpoint, SlothkingMiddleware } from "./index";
import micro from "micro";
import * as http from "http";
const nameArgument = "Lorem";
const numArgument = 12;
const endpointPath = "mock";
const notImplementedEndpointPath = "ni";
const localPort = 3111;
const response = {
  ok: "ok"
};
let server = micro(
  run([
    {
      name: "mocks",
      middlewares: {
        isMock: {
          name: "isMock",
          run: e => async ({ req, res, context }) => {
            context.mock = +context.arguments.num;
            return e({ req, res, context });
          }
        } as SlothkingMiddleware<{ num: number }, { mock: number }>
      },
      endpoints: {
        ni: {
          path: notImplementedEndpointPath
        } as SlothkingEndpoint<{
          someParam: string;
        }>,
        mock: {
          middlewares: ["isMock"],
          path: endpointPath,
          run: async ({ req, res, context }) => {
            console.log(context);
            expect(context.arguments.name).toBe(nameArgument);
            expect(context.mock).toBe(numArgument);
            return response;
          }
        } as SlothkingEndpoint<
          { name: string },
          {
            mock: number;
          },
          any
        >
      }
    }
  ])
);

describe("Extensions, endpoints and middlewares setup", () => {
  beforeAll(() => {
    server.listen(localPort);
    console.log("Server listening");
  });
  test("Endpoint runs on specified path with query params", done => {
    let path = `http://localhost:${localPort}/mocks/${endpointPath}?num=${numArgument}&name=${nameArgument}`;
    console.log(`Trying to get path: ${path}`);
    http.get(path, res => {
      expect(res.statusCode).toBe(200);
      var data = "";

      res.on("data", function(chunk) {
        data += chunk;
      });

      res.on("end", function() {
        expect(data).toBe(JSON.stringify(response));
        done();
      });
    });
  });
  test("Endpoint is not implemented", done => {
    let path = `http://localhost:${localPort}/mocks/${notImplementedEndpointPath}`;
    console.log(`Trying to get path: ${path}`);
    http.get(path, res => {
      expect(res.statusCode).toBe(503);
      done()
    });
  });
  afterAll(() => {
    console.log("Trying to close server");
    server.close();
    console.log("Server closed");
  });
});
