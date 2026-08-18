import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Credentials + JWT. Sengaja tanpa adapter database: satu-satunya akun adalah
 * AdminUser, jadi tabel Session/Account milik NextAuth cuma jadi beban.
 *
 * bcrypt butuh Node runtime, jadi penjagaan /admin dilakukan di layout dan
 * route handler, bukan di middleware (yang jalan di Edge).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.adminUser.findUnique({ where: { email } });
        // Tetap jalankan compare walau user tidak ada, supaya waktu responsnya
        // tidak membocorkan email mana yang terdaftar.
        const hash =
          user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
        const ok = await bcrypt.compare(password, hash);
        if (!user || !ok) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.avatar };
      },
    }),
  ],
});
