import { NextRequest, NextResponse } from "next/server";
import { updateEnrollmentStatusQuery } from "@/db/queries/order";
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
    const { status } = body;

    if (!status || !["ACTIVE", "EXPIRED", "PAUSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedEnrollment = await updateEnrollmentStatusQuery(
      id,
      status as "ACTIVE" | "EXPIRED" | "PAUSED"
    );

    revalidatePath("/coach/dashboard");
    revalidatePath("/coach/members");

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error("UPDATE_ENROLLMENT_STATUS_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update enrollment status" },
      { status: 500 }
    );
  }
}
