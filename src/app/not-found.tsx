"use client";

// Prevent static prerendering of the 404 page.
// The /_not-found route renders within the root layout (which includes AuthProvider).
// force-dynamic ensures this page is only rendered at request time, not during build.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "#00875a",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10h16l-1.5 9.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 10z" fill="rgba(255,255,255,0.3)" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            color: "#00875a",
            lineHeight: 1,
            margin: "0 0 0.5rem",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 0.5rem",
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#64748b",
            margin: "0 0 1.75rem",
            lineHeight: 1.6,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist in the RRV Green Basket admin portal.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/admin/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "12px",
              background: "#00875a",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Go to Dashboard
          </a>
          <a
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.625rem 1.25rem",
              borderRadius: "12px",
              background: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
