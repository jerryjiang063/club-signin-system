import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

// This route will be called by a cron job every day
export async function GET() {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format dates to match database format (YYYY-MM-DD)
    const todayFormatted = today.toISOString().split("T")[0];
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    // Find all plant care assignments for today
    const todayAssignments = await prisma.plantCare.findMany({
      where: {
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      },
      include: {
        user: true,
        plant: true,
      },
    });

    // Find all plant care assignments for tomorrow
    const tomorrowAssignments = await prisma.plantCare.findMany({
      where: {
        startDate: { lte: tomorrow },
        OR: [
          { endDate: null },
          { endDate: { gte: tomorrow } }
        ]
      },
      include: {
        user: true,
        plant: true,
      },
    });

    // Send emails for today's assignments
    const todayResults = await Promise.all(
      todayAssignments.map(async (assignment) => {
        // Check if user has already checked in today
        const existingCheckIn = await prisma.checkIn.findFirst({
          where: {
            userId: assignment.userId,
            plantId: assignment.plantId,
            createdAt: {
              gte: new Date(todayFormatted),
              lt: new Date(new Date(todayFormatted).getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        // Only send reminder if user hasn't checked in yet
        if (!existingCheckIn) {
          return sendReminderEmail(
            assignment.user.email,
            assignment.user.name,
            assignment.plant.name,
            true // isToday = true
          );
        }
        return { skipped: true, reason: "already checked in" };
      })
    );

    // Send emails for tomorrow's assignments
    const tomorrowResults = await Promise.all(
      tomorrowAssignments.map(async (assignment) => {
        return sendReminderEmail(
          assignment.user.email,
          assignment.user.name,
          assignment.plant.name,
          false // isToday = false
        );
      })
    );

    return NextResponse.json({
      success: true,
      todayReminders: todayResults.length,
      tomorrowReminders: tomorrowResults.length,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
