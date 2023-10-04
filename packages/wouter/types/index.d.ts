// Minimum TypeScript Version: 4.1

// tslint:disable:no-unnecessary-generics

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
  RefAttributes,
  ComponentType,
  ReactElement,
  ReactChild,
  ReactPortal,
} from "react";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  LocationHook,
} from "./use-browser-location";

import { RouterObject, RouterOptions } from "./router";

// re-export some types from these modules
export { Path, BaseLocationHook, LocationHook } from "./use-browser-location";
export * from "./router";

import { RouteParams } from "regexparam";

// React <18 only: fixes incorrect `ReactNode` declaration that had `{}` in the union.
// This issue has been fixed in React 18 type declaration.
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56210
type ReactNode =
  | ReactChild
  | Iterable<ReactNode>
  | ReactPortal
  | boolean
  | null
  | undefined;

/**
 * Route patterns and parameters
 */
export interface DefaultParams {
  readonly [paramName: string]: string | undefined;
}

export type Params<T extends DefaultParams = DefaultParams> = T;

export type MatchWithParams<T extends DefaultParams = DefaultParams> = [
  true,
  Params<T>
];
export type NoMatch = [false, null];
export type Match<T extends DefaultParams = DefaultParams> =
  | MatchWithParams<T>
  | NoMatch;

/*
 * Components: <Route />
 */

export interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T;
}

export interface RouteProps<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
> {
  children?:
    | ((
        params: T extends DefaultParams ? T : RouteParams<RoutePath>
      ) => ReactNode)
    | ReactNode;
  path?: RoutePath;
  component?: ComponentType<
    RouteComponentProps<T extends DefaultParams ? T : RouteParams<RoutePath>>
  >;
  nest?: boolean;
}

export function Route<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(props: RouteProps<T, RoutePath>): ReactElement | null;

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

export type RedirectProps<H extends BaseLocationHook = LocationHook> =
  NavigationalProps<H> & {
    children?: never;
  };

export function Redirect<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<RedirectProps<H>>,
  context?: any
): ReactElement<any, any> | null;

export function Link<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<LinkProps<H>> & RefAttributes<HTMLAnchorElement>,
  context?: any
): ReactElement<any, any> | null;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: ReactNode;
}
export const Switch: FunctionComponent<SwitchProps>;

/*
 * Components: <Router />
 */

export type RouterProps = RouterOptions & {
  children: ReactNode;
};

export const Router: FunctionComponent<RouterProps>;

/*
 * Hooks
 */

export function useRouter(): RouterObject;

export function useRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(
  pattern: RoutePath
): Match<T extends DefaultParams ? T : RouteParams<RoutePath>>;

export function useLocation<
  H extends BaseLocationHook = LocationHook
>(): HookReturnValue<H>;

// tslint:enable:no-unnecessary-generics
