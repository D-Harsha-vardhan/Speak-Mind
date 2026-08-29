import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    // Using Prisma Next query pattern: db.orm.public.User.where({ email }).first()
    const existingUser = await db.orm.public.User
      .where({ email })
      .first();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 3. Hash password and create user
    const passwordHash = await hashPassword(password);
    
    // In Prisma Next, we use insert() to create a new record.
    // Let's create the user record:
    const newUser = await db.orm.public.User.create({
      name,
      email,
      passwordHash,
      ageRange: "", // Set empty string, to be updated during onboarding
      preferences: {},
    });

    // 4. Generate JWT & Set cookie
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    const token = await signJWT(tokenPayload);
    await setAuthCookie(token);

    // 5. Return user details (without password hash)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          ageRange: newUser.ageRange,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
