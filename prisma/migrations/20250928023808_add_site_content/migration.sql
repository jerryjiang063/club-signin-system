-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");
