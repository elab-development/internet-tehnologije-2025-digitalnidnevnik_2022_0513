/*
  Warnings:

  - You are about to drop the column `classroomid` on the `teacher_subject_classroom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[homeroomTeacherId]` on the table `classrooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classroomId` to the `teacher_subject_classroom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teacher_subject_classroom" DROP CONSTRAINT "teacher_subject_classroom_classroomid_fkey";

-- AlterTable
ALTER TABLE "teacher_subject_classroom" DROP COLUMN "classroomid",
ADD COLUMN     "classroomId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_homeroomTeacherId_key" ON "classrooms"("homeroomTeacherId");

-- AddForeignKey
ALTER TABLE "teacher_subject_classroom" ADD CONSTRAINT "teacher_subject_classroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
