import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, companyName } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (role === "VENDOR" && !companyName) {
      return NextResponse.json({ message: "Company name is required for Vendors" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role as UserRole;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    if (userRole === "VENDOR") {
      await prisma.vendor.create({
        data: {
          companyName,
          email,
          contactPerson: name,
          phone: "", // Ask for later or add to form
          category: "General", // Default
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ message: "User registered successfully", userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
