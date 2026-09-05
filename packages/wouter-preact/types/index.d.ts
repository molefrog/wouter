// Minimum TypeScript Version: 5.2
// tslint:disable:no-unnecessary-generics

import type {
  JSX,
  FunctionComponent,
  ComponentType,
  ComponentChildren,
} from "preact";

import type {
  Path,
  PathPattern,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  BaseSearchHook,
} from "./location-hook.js";
import type {
  BrowserLocationHook,
  BrowserSearchHook,
} from "./use-browser-location.js";

import type { RouterObject, RouterOptions, Parser } from "./router.js";

export type * from "./location-hook.js";
export type * from "./router.js";

import type { ExtractRouteParams } from "./route-params.js";

export type StringRouteParams<T extends string> = string extends T
  ? DefaultParams
  : ExtractRouteParams<T> & { [param: number]: string | undefined };
export type RegexRouteParams = { [key: string | number]: string | undefined };

/**
 * Route patterns and parameters
 */
export interface DefaultParams {
  readonly [paramName: string | number]: string | undefined;
}

export type Params<T extends object = DefaultParams> = T;

type RouteParamsFor<
  T extends object | undefined,
  P extends PathPattern
> = T extends object
  ? T
  : P extends string
  ? StringRouteParams<P>
  : RegexRouteParams;

export type MatchWithParams<T extends object = DefaultParams> = [
  true,
  Params<T>
];
export type NoMatch = [false, null];
export type Match<T extends object = DefaultParams> =
  | MatchWithParams<T>
  | NoMatch;

/*
 * Components: <Route />
 */

export interface RouteComponentProps<T extends object = DefaultParams> {
  params: T;
}

export interface RouteProps<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
> {
  children?:
    | ((params: RouteParamsFor<T, RoutePath>) => ComponentChildren)
    | ComponentChildren;
  path?: RoutePath;
  component?: ComponentType<RouteComponentProps<RouteParamsFor<T, RoutePath>>>;
  nest?: boolean;
}

export function Route<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
>(props: RouteProps<T, RoutePath>): ReturnType<FunctionComponent>;

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<
  H extends BaseLocationHook = BrowserLocationHook
> = ({ to: Path; href?: never } | { href: Path; to?: never }) &
  HookNavigationOptions<H>;

type AsChildProps<ComponentProps, DefaultElementProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | ({ asChild: true } & ComponentProps);

type HTMLLinkAttributes = Omit<JSX.HTMLAttributes, "className"> & {
  className?: string | undefined | ((isActive: boolean) => string | undefined);
};

export type LinkProps<H extends BaseLocationHook = BrowserLocationHook> =
  NavigationalProps<H> &
    AsChildProps<
      Omit<HTMLLinkAttributes, "onClick" | "ref"> & {
        children: ComponentChildren;
        onClick?: JSX.MouseEventHandler<Element>;
      },
      HTMLLinkAttributes
    >;

export type RedirectProps<H extends BaseLocationHook = BrowserLocationHook> =
  NavigationalProps<H> & {
    children?: never;
  };

export function Redirect<H extends BaseLocationHook = BrowserLocationHook>(
  props: RedirectProps<H>
): null;

export function Link<H extends BaseLocationHook = BrowserLocationHook>(
  props: LinkProps<H>
): ReturnType<FunctionComponent>;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: ComponentChildren;
}
export const Switch: FunctionComponent<SwitchProps>;

/*
 * Components: <Router />
 */

export type RouterProps = RouterOptions & {
  children: ComponentChildren;
};

export const Router: FunctionComponent<RouterProps>;

/*
 * Hooks
 */

export function useRouter(): RouterObject;

export function useRoute<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
>(pattern: RoutePath): Match<RouteParamsFor<T, RoutePath>>;

export function useLocation<
  H extends BaseLocationHook = BrowserLocationHook
>(): HookReturnValue<H>;

export function useSearch<
  H extends BaseSearchHook = BrowserSearchHook
>(): ReturnType<H>;

export type URLSearchParamsInit =
  | ConstructorParameters<typeof URLSearchParams>[0]
  | ReadonlyArray<readonly [string, string]>;

// Preserve custom hooks' required options without accepting arguments that
// useSearchParams does not forward to navigate.
type SearchParamsNavigationArgs<H extends BaseLocationHook> = Extract<
  Parameters<HookReturnValue<H>[1]>,
  [unknown, unknown, ...unknown[]]
> extends never
  ? [options?: Parameters<HookReturnValue<H>[1]>[1]]
  : HookReturnValue<H>[1] extends (to: Path, options: infer Options) => unknown
  ? [options: Options]
  : never;

export type SetSearchParams<H extends BaseLocationHook = BrowserLocationHook> =
  (
    nextInit:
      | URLSearchParamsInit
      | ((prev: URLSearchParams) => URLSearchParamsInit),
    ...args: SearchParamsNavigationArgs<H>
  ) => void;

export function useSearchParams<
  H extends BaseLocationHook = BrowserLocationHook
>(): [URLSearchParams, SetSearchParams<H>];

export function useParams<
  T extends string | object | undefined = undefined
>(): T extends string
  ? StringRouteParams<T>
  : T extends undefined
  ? DefaultParams
  : T;

/*
 * Helpers
 */

export type MatchWithBase<T extends object = DefaultParams> = [
  true,
  Params<T>,
  string
];
// The optional slot lets TS 5.2 consumers destructure the base even on a miss.
type NoMatchWithBase = [false, null, undefined?];
export type LooseMatch<T extends object = DefaultParams> =
  | MatchWithBase<T>
  | NoMatchWithBase;
type OptionalBaseMatch<T extends object> =
  | [true, Params<T>, string?]
  | NoMatchWithBase;

export function matchRoute<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
>(
  parser: Parser,
  pattern: RoutePath,
  path: string,
  loose: true
): LooseMatch<RouteParamsFor<T, RoutePath>>;
export function matchRoute<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
>(
  parser: Parser,
  pattern: RoutePath,
  path: string,
  loose?: false
): Match<RouteParamsFor<T, RoutePath>>;
export function matchRoute<
  T extends object | undefined = undefined,
  RoutePath extends PathPattern = PathPattern
>(
  parser: Parser,
  pattern: RoutePath,
  path: string,
  loose: boolean | undefined
): OptionalBaseMatch<RouteParamsFor<T, RoutePath>>;

// tslint:enable:no-unnecessary-generics
