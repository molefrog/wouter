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

export interface LocationHookOptions {
  base?: Path;
}
export type LocationHook = (options?: LocationHookOptions) => LocationTuple;

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

export interface RouteProps<T extends DefaultParams = DefaultParams> {
  children?: ((params: Params<T>) => ReactNode) | ReactNode;
  path: Path;
  component?: ComponentType<RouteComponentProps<T>>;
}

// tslint:disable:no-unnecessary-generics
export function Route<T extends DefaultParams = DefaultParams>(
  props: RouteProps<T>
): ReactElement | null;
// tslint:enable:no-unnecessary-generics

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
  base: Path;
  matcher: MatcherFn;
}
export const Router: FunctionComponent<Partial<RouterProps> & {
  children: ReactNode;
}>;

export function useRouter(): RouterProps;

export function useRoute<T extends DefaultParams = DefaultParams>(
  pattern: Path
): Match<T>; // tslint:disable-line:no-unnecessary-generics

export function useLocation(): LocationTuple;
