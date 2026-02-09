import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bc from "bcryptjs";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "default-secret-change-me"
);

export async function hashPassword(password: string) {
    return await bc.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return await bc.compare(password, hash);
}

export async function createSession(userId: string) {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);

    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, secret);
        return payload as { userId: string };
    } catch (e) {
        return null;
    }
}

export async function deleteSession() {
    (await cookies()).set("session", "", { expires: new Date(0) });
}
