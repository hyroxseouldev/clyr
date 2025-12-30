import { getMyCoachProfileAction } from "@/actions/auth";
import { CoachProfileContent } from "../../../../components/auth/coach-profile-content";

export default async function CoachProfilePage() {
  const result = await getMyCoachProfileAction();

  return (
    <CoachProfileContent
      initialProfile={result.success && result.data ? result.data : null}
    />
  );
}
