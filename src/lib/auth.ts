import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { env, isGoogleAuthConfigured, isMongoConfigured } from "@/config/env";
import { connectToDatabase } from "@/lib/mongoose";
import { demoUser } from "@/lib/mock-data";
import { verifyPassword } from "@/lib/password";
import { UserModel } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        if (!isMongoConfigured) {
          return null;
        }

        await connectToDatabase();
        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        }).lean();

        if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.name ?? credentials.email,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
    ...(isGoogleAuthConfigured
      ? [
          GoogleProvider({
            clientId: env.googleClientId!,
            clientSecret: env.googleClientSecret!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  secret: env.authSecret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.email || !isMongoConfigured) {
        return true;
      }

      await connectToDatabase();

      const existing = await UserModel.findOne({ email: user.email.toLowerCase() });
      if (!existing) {
        await UserModel.create({
          name: user.name ?? user.email.split("@")[0],
          email: user.email.toLowerCase(),
          image: user.image ?? "",
          googleId: profile && "sub" in profile ? String(profile.sub) : undefined,
          dailyCalories: demoUser.dailyCalories,
          macroTargets: demoUser.macroTargets,
          flexibleBudget: demoUser.flexibleBudget,
          waterTarget: demoUser.waterTarget,
        });
      } else {
        existing.name = user.name ?? existing.name;
        existing.image = user.image ?? existing.image;
        if (profile && "sub" in profile) {
          existing.googleId = String(profile.sub);
        }
        await existing.save();
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      if (token.email && isMongoConfigured) {
        await connectToDatabase();
        const existing = await UserModel.findOne({ email: String(token.email).toLowerCase() })
          .select("_id")
          .lean();
        if (existing?._id) {
          token.sub = String(existing._id);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? demoUser.id;
        session.user.provider = typeof token.provider === "string" ? token.provider : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  if (!isMongoConfigured) {
    return {
      ...demoUser,
      id: session.user.id ?? demoUser.id,
      name: session.user.name ?? demoUser.name,
      email: session.user.email ?? demoUser.email,
      image: session.user.image ?? "",
    };
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id).lean();

  if (!user) {
    return {
      ...demoUser,
      id: session.user.id ?? demoUser.id,
      name: session.user.name ?? demoUser.name,
      email: session.user.email ?? demoUser.email,
      image: session.user.image ?? "",
    };
  }

  return {
    ...demoUser,
    id: String(user._id),
    name: user.name ?? demoUser.name,
    email: user.email ?? demoUser.email,
    image: user.image ?? "",
    age: user.age ?? demoUser.age,
    gender: user.gender ?? demoUser.gender,
    height: user.height ?? demoUser.height,
    weight: user.weight ?? demoUser.weight,
    goal: user.goal ?? demoUser.goal,
    activityLevel: user.activityLevel ?? demoUser.activityLevel,
    dailyCalories: user.dailyCalories ?? demoUser.dailyCalories,
    macroTargets: user.macroTargets ?? demoUser.macroTargets,
    flexibleBudget: user.flexibleBudget ?? demoUser.flexibleBudget,
    waterTarget: user.waterTarget ?? demoUser.waterTarget,
  };
}
