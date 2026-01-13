-- AlterTable
ALTER TABLE "classrooms" ADD COLUMN     "homeroomTeacherId" INTEGER;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
