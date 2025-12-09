import { useRouter } from "wouter";

export function WithStatusCode({
  code,
  children,
}: {
  code: number;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Set status code on SSR context if available
  // Cast to any because statusCode is not yet in the official types
  if (router.ssrContext) {
    (router.ssrContext as any).statusCode = code;
  }

  return <>{children}</>;
}
