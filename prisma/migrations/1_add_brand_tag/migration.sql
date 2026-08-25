-- CreateTable: Brand
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex: Brand
CREATE UNIQUE INDEX IF NOT EXISTS "Brand_name_key" ON "Brand"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Brand_slug_key" ON "Brand"("slug");

-- CreateTable: Tag
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex: Tag
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

-- CreateTable: _ProductTags (many-to-many)
CREATE TABLE IF NOT EXISTS "_ProductTags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateUniqueIndex: _ProductTags
CREATE UNIQUE INDEX IF NOT EXISTS "_ProductTags_AB_unique" ON "_ProductTags"("A", "B");
CREATE INDEX IF NOT EXISTS "_ProductTags_B_index" ON "_ProductTags"("B");

-- AddForeignKey: _ProductTags -> Product
ALTER TABLE "_ProductTags" ADD CONSTRAINT "_ProductTags_A_fkey" 
    FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: _ProductTags -> Tag
ALTER TABLE "_ProductTags" ADD CONSTRAINT "_ProductTags_B_fkey" 
    FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn: brandId to Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brandId" UUID;

-- AddForeignKey: Product -> Brand
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Product_brandId_fkey'
    ) THEN
        ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey"
            FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: _ProductCategories (many-to-many, if not exists)
CREATE TABLE IF NOT EXISTS "_ProductCategories" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_ProductCategories_AB_unique" ON "_ProductCategories"("A", "B");
CREATE INDEX IF NOT EXISTS "_ProductCategories_B_index" ON "_ProductCategories"("B");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_ProductCategories_A_fkey'
    ) THEN
        ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey"
            FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_ProductCategories_B_fkey'
    ) THEN
        ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey"
            FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
