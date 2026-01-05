import { ProgramEditForm } from "@/components/program/program-edit-form";
import { Program } from "@/db/schema";

const ProgramInfoTab = ({ program }: { program: Program }) => {
  return (
    <>
      <ProgramEditForm initialData={program} />
    </>
  );
};

export default ProgramInfoTab;
