
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress the specific React 19 / Next.js 16 development warning.
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development"
) {
  const originalError = console.error;

  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Encountered a script tag while rendering React component"
      )
    ) {
      return;
    }

    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
