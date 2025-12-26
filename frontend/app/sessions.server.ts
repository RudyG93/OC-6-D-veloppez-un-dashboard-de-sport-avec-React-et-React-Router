import { createCookieSessionStorage } from "react-router";

type SessionData = {
  token?: string;
  userId?: string;
};

type SessionFlashData = {
  error?: string;
};

const sessionSecret =
  process.env.SESSION_SECRET ?? "dev-secret-change-me-please";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__sportsee_session",
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secrets: [sessionSecret],
      secure: false,
    },
  });