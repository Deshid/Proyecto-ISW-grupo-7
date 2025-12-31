"use strict";
import { EntitySchema } from "typeorm";

const ProfessorCreatedSubjectSchema = new EntitySchema({
  name: "ProfessorCreatedSubject",
  tableName: "professor_created_subjects",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    professorId: {
      type: "int",
      nullable: false,
      name: "professor_id",
    },
    subjectId: {
      type: "int",
      nullable: false,
      name: "subject_id",
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
      name: "created_at",
    },
  },
  indices: [
    {
      name: "IDX_PROFESSOR_CREATED_SUBJECT",
      columns: ["id"],
      unique: true,
    },
  ],
});

export default ProfessorCreatedSubjectSchema;
