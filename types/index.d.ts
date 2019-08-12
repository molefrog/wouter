// Type defitions for wouter are generously provided by:
// * Alexander Tolkunov <https://github.com/StrayFromThePath>
// * Maksim Karelov <https://github.com/Ty3uK>

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  ComponentType,
  ReactElement,
  ReactNode
} from "react";

export type Path = string;
export type PushCallback = (to: Path, replace?: boolean) => void;

export type LocationTuple = [Path, PushCallback];
export type LocationHook = () => LocationTuple;

export interface Params {
  [paramName: string]: string;
}

export type MatchWithParams = [true, Params];
export type NoMatch = [false, null];
export type Match = MatchWithParams | NoMatch;

export type MatcherFn = (pattern: Path, path: Path) => Match;

export interface RouteProps {
  children?: ((params: Params) => ReactNode) | ReactNode;
  path: Path;
  component?: ComponentType<any>;
}
export const Route: FunctionComponent<RouteProps>;

export type NavigationalProps =
  | { to: Path; href?: never }
  | { href: Path; to?: never };

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  NavigationalProps;

export const Link: FunctionComponent<LinkProps>;

export type RedirectProps = NavigationalProps & {
  children?: never;
};

export const Redirect: FunctionComponent<RedirectProps>;

export interface SwitchProps {
  location?: string;
  children: Array<ReactElement<RouteProps>>;
}
export const Switch: FunctionComponent<SwitchProps>;

export interface RouterProps {
  hook: LocationHook;
  matcher: MatcherFn;
}
export const Router: FunctionComponent<
  Partial<RouterProps> & {
    children: ReactNode;
  }
>;

export function useRouter(): RouterProps;

export function useRoute(pattern: Path): Match;

export function useLocation(): LocationTuple;
