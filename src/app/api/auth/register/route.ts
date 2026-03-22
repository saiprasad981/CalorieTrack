import { NextResponse } from "next/server";
import { z } from "zod";

import { isMongoConfigured } from "@/config/env";
import { connectToDatabase } from "@/lib/mongoose";
import { hashPassword } from "@/lib/password";
import { demoUser } from "@/lib/mock-data";
import { UserModel } from "@/models/User";
import { defaultSettings } from "@/services/user.service";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(13).max(100),
  gender: z.string().min(1),
  height: z.number().min(100).max(240),
  weight: z.number().min(30).max(300),
});

function buildProfileDefaults(input: z.infer<typeof registerSchema>) {
  const bmr =
    10 * input.weight +
    6.25 * input.height -
    5 * input.age +
    (/male/i.test(input.gender) ? 5 : -161);
  const dailyCalories = Math.max(1400, Math.round(bmr * 1.45 - 250));
  const protein = Math.round(input.weight * 1.8);
  const fat = Math.round(input.weight * 0.85);
  const carbs = Math.max(120, Math.round((dailyCalories - protein * 4 - fat * 9) / 4));

  return {
    dailyCalories,
    macroTargets: {
      protein,
      carbs,
      fat,
      fiber: 30,
    },
    flexibleBudget: {
      mode: "weekend",
      weekdayCalories: dailyCalories,
      weekendCalories: dailyCalories + 250,
    },
    waterTarget: 2600,
    goal: "lose",
    activityLevel: "moderate",
  };
}

export async function POST(request: Request) {
  const body = registerSchema.parse(await request.json());

  if (!isMongoConfigured) {
    return NextResponse.json(
      {
        message:
          "Local signup is not configured yet. Add a real MONGODB_URI in .env.local to create accounts here.",
      },
      { status: 503 },
    );
  }

  await connectToDatabase();

  const email = body.email.toLowerCase();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(body.password);
  const defaults = buildProfileDefaults(body);

  const user = await UserModel.create({
    name: body.name,
    email,
    passwordHash,
    image: "",
    age: body.age,
    gender: body.gender,
    height: body.height,
    weight: body.weight,
    ...defaults,
    settings: defaultSettings,
  });

  return NextResponse.json(
    {
      user: {
        id: String(user._id),
        name: user.name ?? demoUser.name,
        email: user.email ?? demoUser.email,
      },
    },
    { status: 201 },
  );
}
