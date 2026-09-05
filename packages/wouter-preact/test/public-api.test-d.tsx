/** @jsxImportSource preact */
import {
  Link,
  Redirect,
  Route,
  Router,
  Switch,
  matchRoute,
  useLocation,
  useParams,
  useRoute,
  useSearch,
  useSearchParams,
} from "wouter-preact";
import type {
  Parser,
  RouteComponentProps,
  RouterObject,
  RouterOptions,
  StringRouteParams,
} from "wouter-preact";
import { memoryLocation } from "wouter-preact/memory-location";

const location = memoryLocation({ path: "/users/42", record: true });
const routerOptions = {
  hook: location.hook,
  searchHook: location.searchHook,
  ssrPath: "/users/42",
} satisfies RouterOptions;

function User({ params }: RouteComponentProps<{ id: string }>) {
  return <p>{params.id.toUpperCase()}</p>;
}

function Hooks() {
  const [matched, params] = useRoute("/users/:id/:tab?");
  if (matched) {
    params.id.toUpperCase();
    params.tab?.toUpperCase();
  } else {
    const absent: null = params;
    void absent;
  }

  useParams<"/users/:id">().id.toUpperCase();
  const [path, navigate] = useLocation();
  navigate(path, { replace: true, state: { from: "/" } });
  useSearch().toUpperCase();
  const [search, setSearch] = useSearchParams();
  setSearch(
    (previous) => {
      previous.set("q", search.get("q") ?? "");
      return previous;
    },
    { replace: true }
  );

  return null;
}

export const application = (
  <Router {...routerOptions}>
    <Link href="/users/42">User</Link>
    <Link to="/" className={(active) => (active ? "active" : undefined)}>
      Home
    </Link>
    <Switch location="/users/42">
      <Route path="/users/:id" component={User} />
      <Route path="/posts/:slug">
        {(params) => <p>{params.slug.toUpperCase()}</p>}
      </Route>
      <Route>
        <Redirect to="/" replace />
      </Route>
    </Switch>
    <Hooks />
  </Router>
);

// @ts-expect-error Choose either href or to.
export const ambiguousLink = <Link href="/one" to="/two" />;

// @ts-expect-error A destination is required.
export const missingRedirect = <Redirect />;

interface UserParams {
  id: string;
  tab?: string;
}

export const interfaceRoute = (
  <Route<UserParams> path="/users/:id/:tab?">
    {(params) => (
      <p>
        {params.id.toUpperCase()}
        {params.tab?.toUpperCase()}
      </p>
    )}
  </Route>
);

export const optionalDuplicate: StringRouteParams<"/:id/:id?"> = {
  id: undefined,
};
export const requiredDuplicate: StringRouteParams<"/:id?/:id"> = {
  id: "42",
};

// @ts-expect-error The final required capture cannot be omitted.
export const missingDuplicate: StringRouteParams<"/:id?/:id"> = {};

const missingKeys: Parser = () => ({ pattern: /^\/users\/(\w+)/ });
const falseKeys: Parser = () => ({
  pattern: /^\/users\/(\w+)/,
  keys: false,
});
const readonlyKeys: Parser = () => ({
  pattern: /^\/users\/(\w+)/,
  keys: ["id"] as const,
});

export const customParsers: RouterOptions[] = [
  { parser: missingKeys },
  { parser: falseKeys },
  { parser: readonlyKeys },
  {
    hrefs: (href, router) => {
      const currentRouter: RouterObject = router;
      // @ts-expect-error RouterObject has no arbitrary properties.
      router.missingProperty;
      return currentRouter.base + href;
    },
  },
];

function ImprovedRouteInference(dynamicPattern: string) {
  const [, explicit] = useRoute<UserParams>("/users/:id/:tab?");
  if (explicit) {
    const id: string = explicit.id;
    const optional: string | undefined = explicit.tab;
    void [id, optional];
  }

  const [, wildcard] = useRoute("/files/*/edit");
  if (wildcard) {
    const capture: string = wildcard["*"];
    // @ts-expect-error Runtime names wildcard captures "*", not "wild".
    wildcard.wild;
    void capture;
  }

  const [, filename] = useRoute("/files/:name.json/:version?.txt");
  if (filename) {
    const name: string = filename.name;
    const version: string | undefined = filename.version;
    // @ts-expect-error The extension is not part of the parameter name.
    filename["name.json"];
    void [name, version];
  }

  const [, optional] = useRoute("/:id/:id?");
  if (optional) {
    const lastCapture: string | undefined = optional.id;
    // @ts-expect-error The final optional capture can be absent.
    const required: string = optional.id;
    void [lastCapture, required];
  }

  const [, dynamic] = useRoute(dynamicPattern);
  if (dynamic) {
    const named: string | undefined = dynamic.id;
    const numbered: string | undefined = dynamic[0];
    // @ts-expect-error A dynamic pattern does not guarantee named parameters.
    const required: string = dynamic.id;
    void [named, numbered, required];
  }

  const [matched, params, base] = matchRoute(
    readonlyKeys,
    "/users/:id",
    "/users/42/details",
    true
  );
  if (matched) {
    const id: string = params.id;
    const matchedBase: string = base;
    void [id, matchedBase];
  } else {
    const missingParams: null = params;
    const missingBase: undefined = base;
    void [missingParams, missingBase];
  }
}

const statefulMemory = memoryLocation({ state: { page: 1 } });

function StatefulHooks() {
  const [, directlyNavigate] = statefulMemory.hook();
  directlyNavigate("/users", { state: { page: 2 } });
  // @ts-expect-error Memory state retains the initial object's shape.
  directlyNavigate("/users", { state: { page: "two" } });

  const [, navigate] = useLocation<typeof statefulMemory.hook>();
  navigate("/users", { state: { page: 2 } });
  // @ts-expect-error useLocation preserves custom navigation options.
  navigate("/users", { state: { page: "two" } });

  const [, setSearch] = useSearchParams<typeof statefulMemory.hook>();
  const entries = [["page", "2"]] as const;
  setSearch(entries, { state: { page: 2 } });
  setSearch(() => entries);
  // @ts-expect-error Search updates use the location hook's state type.
  setSearch(entries, { state: { page: "two" } });

  const [, setBrowserSearch] = useSearchParams();
  setBrowserSearch(entries, { transition: true });
  return null;
}

void [ImprovedRouteInference, StatefulHooks];

type NullableOptionsHook = () => [
  string,
  (to: string, options?: { token: string } | null) => void
];
type RequiredOptionsHook = () => [
  string,
  (to: string, options: { token: string }) => void
];
type OptionalOptionsHook = () => [
  string,
  (to: string, options?: { token: string }) => void
];

function CustomSearchOptions() {
  const [, setNullableSearch] = useSearchParams<NullableOptionsHook>();
  setNullableSearch("q=test", null);
  setNullableSearch("q=test", undefined);
  setNullableSearch("q=test");
  setNullableSearch("q=test", { token: "session" });
  // @ts-expect-error Only the hook's declared options are allowed.
  setNullableSearch("q=test", 123);

  const [, setUnionSearch] = useSearchParams<
    RequiredOptionsHook | OptionalOptionsHook
  >();
  setUnionSearch("q=test", { token: "session" });
  // @ts-expect-error The options must be safe for either possible hook.
  setUnionSearch("q=test");
  // @ts-expect-error The required branch does not accept undefined.
  setUnionSearch("q=test", undefined);
}

void CustomSearchOptions;
