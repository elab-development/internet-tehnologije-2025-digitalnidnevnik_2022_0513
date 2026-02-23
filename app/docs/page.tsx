"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// dinamicki import za SwaggerUI (client-side)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-slate-600">
        Učitavanje API dokumentacije...
      </div>
    </div>
  ),
});

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="py-6 px-4 border-b bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-800">
            eDnevnik API Dokumentacija
          </h1>
          <p className="text-slate-600 mt-1">
            OpenAPI 3.0 specifikacija za digitalni učenički dnevnik
          </p>
        </div>
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  );
};

export default DocsPage;
