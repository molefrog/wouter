// Minimum TypeScript Version: 4.1
// tslint:disable:no-unnecessary-generics

import {
  JSX,
  FunctionComponent,
  ComponentType,
  ComponentChildren,
  VNode,
} from "preact";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
} from "./location-hook";
import { BrowserLocationHook } from "./use-browser-location";

import { RouterObject, RouterOptions } from "./router";

// re-export some types from these modules
export { Path, BaseLocationHook } from "./location-hook";
export * from "./router";

import { RouteParams } from "regexparam";

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
      ) => ComponentChildren)
    | ComponentChildren;
  path?: RoutePath;
  component?: ComponentType<
    RouteComponentProps<T extends DefaultParams ? T : RouteParams<RoutePath>>
  >;
}

export function Route<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(props: RouteProps<T, RoutePath>): VNode<any> | null;

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<H extends BaseLocationHook = BrowserLocationHook> = (
  | { to: Path; href?: never }
  | { href: Path; to?: never }
) &
  HookNavigationOptions<H>;

export type LinkProps<H extends BaseLocationHook = BrowserLocationHook> = Omit<
  JSX.HTMLAttributes,
  "href"
> &
  NavigationalProps<H>;

export type RedirectProps<H extends BaseLocationHook = BrowserLocationHook> =
  NavigationalProps<H> & {
    children?: never;
  };

export function Redirect<H extends BaseLocationHook = BrowserLocationHook>(
  props: RedirectProps<H>,
  context?: any
): VNode<any> | null;
export function Link<H extends BaseLocationHook = BrowserLocationHook>(
  props: LinkProps<H>,
  context?: any
): VNode<any> | null;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: Array<VNode<RouteProps>>;
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
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(
  pattern: RoutePath
): Match<T extends DefaultParams ? T : RouteParams<RoutePath>>;

export function useLocation<
  H extends BaseLocationHook = BrowserLocationHook
>(): HookReturnValue<H>;

export function useParams<T = undefined>(): T extends string
  ? RouteParams<T>
  : T extends undefined
  ? DefaultParams
  : T;

// tslint:enable:no-unnecessary-generics
