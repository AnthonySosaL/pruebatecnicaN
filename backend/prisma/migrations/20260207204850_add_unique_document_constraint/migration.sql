/*
  Warnings:

  - A unique constraint covering the columns `[type,documentNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_type_documentNumber_key" ON "Document"("type", "documentNumber");
