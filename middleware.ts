import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/dang-nhap",
    },
});

export const config = {
    matcher: [
        "/((?!dang-nhap|api|static|.*\\..*|_next).*)",
    ],
};
