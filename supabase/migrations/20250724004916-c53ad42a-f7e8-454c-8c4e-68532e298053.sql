-- Make mitra_id nullable in tagihan table to allow orders without assigned mitra
ALTER TABLE public.tagihan ALTER COLUMN mitra_id DROP NOT NULL;