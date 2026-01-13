-- CreateTable
CREATE TABLE "teacher_subject_classroom" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classroomid" INTEGER NOT NULL,

    CONSTRAINT "teacher_subject_classroom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teacher_subject_classroom" ADD CONSTRAINT "teacher_subject_classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_classroom" ADD CONSTRAINT "teacher_subject_classroom_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_classroom" ADD CONSTRAINT "teacher_subject_classroom_classroomid_fkey" FOREIGN KEY ("classroomid") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
