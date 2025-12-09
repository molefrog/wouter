import { Link } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";

export function NotFoundPage() {
  return (
    <div className="pt-12">
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center  border border-neutral-300/75 rounded-lg p-4 w-9 h-9 font-medium text-neutral-400 mx-auto text-xs mb-6">
        404
      </div>

      <h1 className="text-3xl font-medium tracking-tight text-center mb-4">
        Not Found
      </h1>
      <p className="text-neutral-400 text-center max-w-md mx-auto">
        We are sorry, but the page you're looking for doesn't exist. Try going
        back to the{" "}
        <Link href="/" className="underline hover:text-neutral-900">
          home page
        </Link>
        .
      </p>
    </div>
  );
}
