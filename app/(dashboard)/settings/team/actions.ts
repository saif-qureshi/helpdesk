"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/enums";
import { env } from "@/lib/env";
import { AppError } from "@/lib/core/errors";
import { requireRole } from "@/lib/auth/tenant";
import { invitationRepository, memberRepository } from "@/lib/container";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ResendResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof AppError) return { ok: false, error: err.message };
  console.error("[team-action]", err);
  return { ok: false, error: "Something went wrong." };
}

export async function inviteMemberAction(
  email: string,
  role: "ADMIN" | "AGENT",
): Promise<ActionResult> {
  try {
    const ctx = await requireRole(Role.ADMIN);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return { ok: false, error: "Enter a valid email." };
    await invitationRepository.create({
      organisationId: ctx.organisationId,
      email: clean,
      role: role === "ADMIN" ? Role.ADMIN : Role.AGENT,
      token: crypto.randomUUID(),
    });
    revalidatePath("/settings/team");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function revokeInvitationAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await requireRole(Role.ADMIN);
    await invitationRepository.deleteById(id, ctx.organisationId);
    revalidatePath("/settings/team");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function resendInvitationAction(id: string): Promise<ResendResult> {
  try {
    const ctx = await requireRole(Role.ADMIN);
    const token = crypto.randomUUID();
    await invitationRepository.setToken(id, ctx.organisationId, token);
    revalidatePath("/settings/team");
    // Email delivery lands in Phase 2; for now return the link to share.
    return { ok: true, url: `${env.NEXT_PUBLIC_APP_URL}/invite/${token}` };
  } catch (err) {
    return fail(err);
  }
}

export async function changeMemberRoleAction(
  id: string,
  role: Role,
): Promise<ActionResult> {
  try {
    const ctx = await requireRole(Role.ADMIN);
    await memberRepository.updateRole(id, ctx.organisationId, role);
    revalidatePath("/settings/team");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeMemberAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await requireRole(Role.ADMIN);
    await memberRepository.deleteById(id, ctx.organisationId);
    revalidatePath("/settings/team");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
