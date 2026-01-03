import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                    include: {
                        roleRef: {
                            include: { permissions: true }
                        }
                    }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: String(user.id),
                    name: user.username,
                    role: user.role,
                    permissions: user.roleRef?.permissions.map(p => p.code) || []
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.permissions = user.permissions;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.permissions = token.permissions;
            }
            return session;
        },
    },
    pages: {
        signIn: "/dang-nhap",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
