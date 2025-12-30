import { ProgramForm } from "@/components/program/program-form";
import { Program } from "@/db/schema";

const ProgramInfoTab = ({ program }: { program: Program }) => {
  return (
    <>
      <ProgramForm initialData={program} />
    </>
  );
};

export default ProgramInfoTab;
