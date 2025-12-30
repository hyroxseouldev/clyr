import { getMyCoachProfileAction } from "@/lib/auth/actions";
import { CoachProfileContent } from "./CoachProfileContent";

export default async function CoachProfilePage() {
  const result = await getMyCoachProfileAction();

  return (
    <CoachProfileContent
      initialProfile={result.success ? result.data : null}
    />
  );
}
