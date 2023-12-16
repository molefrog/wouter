// Minimum TypeScript Version: 4.1

// tslint:disable:no-unnecessary-generics

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  RefAttributes,
  ComponentType,
  ReactNode,
  ReactElement,
  MouseEventHandler,
} from "react";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  BaseSearchHook,
} from "./location-hook.js";
import {
  BrowserLocationHook,
  BrowserSearchHook,
} from "./use-browser-location.js";

import { RouterObject, RouterOptions } from "./router.js";

// these files only export types, so we can re-export them as-is
// in TS 5.0 we'll be able to use `export type * from ...`
export * from "./location-hook.js";
export * from "./router.js";

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
>(props: RouteProps<T, RoutePath>): ReturnType<FunctionComponent>;

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<
  H extends BaseLocationHook = BrowserLocationHook
> = ({ to: Path; href?: never } | { href: Path; to?: never }) &
  HookNavigationOptions<H>;

export type RedirectProps<H extends BaseLocationHook = BrowserLocationHook> =
  NavigationalProps<H> & {
    children?: never;
  };

export function Redirect<H extends BaseLocationHook = BrowserLocationHook>(
  props: RedirectProps<H>,
  context?: any
): null;

type AsChildProps<ComponentProps, DefaultElementProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | ({ asChild: true } & ComponentProps);

export type LinkProps<H extends BaseLocationHook = BrowserLocationHook> =
  NavigationalProps<H> &
    AsChildProps<
      { children: ReactElement; onClick?: MouseEventHandler },
      AnchorHTMLAttributes<HTMLAnchorElement> & RefAttributes<HTMLAnchorElement>
    >;

export function Link<H extends BaseLocationHook = BrowserLocationHook>(
  props: LinkProps<H>,
  context?: any
): ReturnType<FunctionComponent>;

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
  H extends BaseLocationHook = BrowserLocationHook
>(): HookReturnValue<H>;

export function useSearch<
  H extends BaseSearchHook = BrowserSearchHook
>(): ReturnType<H>;

export function useParams<T = undefined>(): T extends string
  ? RouteParams<T>
  : T extends undefined
  ? DefaultParams
  : T;

// tslint:enable:no-unnecessary-generics
