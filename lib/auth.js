import { auth } from "@clerk/nextjs/server";

/**
 * Verify whether the currently logged-in user is authenticated
 * and matches the ALLOWED_USER_ID specified in the environment.
 */
export async function verifyAllowedUser() {
  const { userId } = await auth();

  if (!userId) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized: Please sign in to continue.",
      userId: null,
    };
  }

  const allowedUserId = process.env.ALLOWED_USER_ID;
  if (allowedUserId && userId !== allowedUserId) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: This private instance is restricted to an authorized administrator.",
      userId,
    };
  }

  return {
    authorized: true,
    status: 200,
    userId,
  };
}
