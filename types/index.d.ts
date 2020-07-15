// Type defitions for wouter are generously provided by:
// * Alexander Tolkunov <https://github.com/StrayFromThePath>
// * Maksim Karelov <https://github.com/Ty3uK>

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";

/*
 * Foundation: useLocation and paths
 */

export type Path = string;

// the base useLocation hook type. Any custom hook (including the
// default one) should inherit from it.
export type BaseLocationHook = (
  ...args: any[]
) => [Path, (path: Path, ...args: any[]) => any];

/*
 * Utility types that operate on hook
 */

// Returns the type of the location tuple of the given hook.
export type HookReturnValue<H extends BaseLocationHook> = ReturnType<H>;

// Returns the type of the navigation options that hook's push function accepts.
export type HookNavigationOptions<H extends BaseLocationHook> = HookReturnValue<
  H
>[1] extends (path: Path, options: infer R, ...rest: any[]) => any
  ? R extends { [k: string]: any }
    ? R
    : {}
  : {};

/*
 * Default `useLocation`
 */

// The type of the default `useLocation` hook that wouter uses.
// It operates on current URL using History API, supports base path and can
// navigate with `pushState` or `replaceState`.
export type LocationHook = (options?: {
  base?: Path;
}) => [Path, (to: Path, options?: { replace?: boolean }) => void];

export type LocationTuple = HookReturnValue<LocationHook>;

/*
 * Match and params
 */

export interface DefaultParams {
  [paramName: string]: string;
}
export type Params<T extends DefaultParams = DefaultParams> = T;

export interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T;
}

export type MatchWithParams<T extends DefaultParams = DefaultParams> = [
  true,
  Params<T>
];
export type NoMatch = [false, null];
export type Match<T extends DefaultParams = DefaultParams> =
  | MatchWithParams<T>
  | NoMatch;

export type MatcherFn = (pattern: Path, path: Path) => Match;

/*
 * Components: <Route />
 */

export interface RouteProps<T extends DefaultParams = DefaultParams> {
  children?: ((params: Params<T>) => ReactNode) | ReactNode;
  path?: Path;
  component?: ComponentType<RouteComponentProps<T>>;
}

// tslint:disable:no-unnecessary-generics
export function Route<T extends DefaultParams = DefaultParams>(
  props: RouteProps<T>
): ReactElement | null;
// tslint:enable:no-unnecessary-generics

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<H extends BaseLocationHook = LocationHook> = (
  | { to: Path; href?: never }
  | { href: Path; to?: never }
) &
  HookNavigationOptions<H>;

export type LinkProps<H extends BaseLocationHook = LocationHook> = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> &
  NavigationalProps<H>;

export type RedirectProps<
  H extends BaseLocationHook = LocationHook
> = NavigationalProps<H> & {
  children?: never;
};

export function Redirect<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<RedirectProps<H>>, // tslint:disable-line:no-unnecessary-generics
  context?: any
): ReactElement<any, any> | null;

export function Link<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<LinkProps<H>>, // tslint:disable-line:no-unnecessary-generics
  context?: any
): ReactElement<any, any> | null;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: Array<ReactElement<RouteProps>>;
}
export const Switch: FunctionComponent<SwitchProps>;

/*
 * Components: <Router />
 */

export interface RouterProps {
  hook: BaseLocationHook;
  base: Path;
  matcher: MatcherFn;
}
export const Router: FunctionComponent<
  Partial<RouterProps> & {
    children: ReactNode;
  }
>;

/*
 * Hooks
 */

export function useRouter(): RouterProps;

export function useRoute<T extends DefaultParams = DefaultParams>(
  pattern: Path
): Match<T>; // tslint:disable-line:no-unnecessary-generics

export function useLocation<
  H extends BaseLocationHook = LocationHook
>(): HookReturnValue<H>; // tslint:disable-line:no-unnecessary-generics
