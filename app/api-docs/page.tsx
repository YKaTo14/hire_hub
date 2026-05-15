"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">HireHub API Docs</h1>
        <SwaggerUI url="/api/openapi" />
      </div>
    </main>
  );
}
