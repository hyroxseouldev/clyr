import { NextRequest, NextResponse } from "next/server";
import { updateEnrollmentEndDateQuery } from "@/db/queries/order";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { endDate } = body;

    if (!endDate) {
      return NextResponse.json({ error: "endDate is required" }, { status: 400 });
    }

    const updatedEnrollment = await updateEnrollmentEndDateQuery(
      id,
      new Date(endDate)
    );

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error("EXTEND_ENROLLMENT_ERROR", error);
    return NextResponse.json(
      { error: "Failed to extend enrollment" },
      { status: 500 }
    );
  }
}
