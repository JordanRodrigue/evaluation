"use client";

// Ensure `global` exists in the browser bundle for packages that assume Node globals
if (typeof (globalThis as any).global === "undefined" && typeof window !== "undefined") {
  (globalThis as any).global = window as any;
}


