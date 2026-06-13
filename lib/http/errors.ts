import { NextResponse } from "next/server";
import { errors as vineErrors } from "@vinejs/vine";
import { ZodError } from "zod";
import { AppError } from "@/lib/core/errors";

/**
 * Maps thrown errors to HTTP responses so route handlers stay thin: they call a
 * validator + service and let this translate validation/domain errors to status
 * codes. Handles VineJS (request validation), Zod (internal), and AppError.
 */
export function toHttpError(err: unknown): NextResponse {
  if (err instanceof vineErrors.E_VALIDATION_ERROR) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: err.messages },
      { status: 422 },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: err.issues },
      { status: 422 },
    );
  }
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.code, message: err.message },
      { status: err.httpStatus },
    );
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}
