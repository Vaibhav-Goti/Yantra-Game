// src/pages/ErrorPage.tsx
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  if (error.status === 404) {
    return <div className="d-flex flex-column align-items-center p-3 text-danger">
      <h1>404: Page Not Found</h1>
    </div>
  }

  if (error.status === 500) {
    return <div className="d-flex flex-column align-items-center p-3 text-danger">
      <h1>500: Internal Server Error</h1>;
    </div>
  }

  // Handle non-HTTP errors or unexpected errors
  if (error instanceof Error) {
    return (
      <div className="d-flex flex-column align-items-center p-3 text-danger">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.message}</i>
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center p-3 text-danger">
      <h1>404: Page Not Found</h1>
      <p>Sorry, an unexpected error has occurred.</p>
    </div>
  );
}