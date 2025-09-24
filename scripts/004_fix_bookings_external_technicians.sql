-- Fix bookings table to support external technicians (Google Places)
-- Make technician_id nullable and add external technician fields

-- Make technician_id nullable to allow external technicians
ALTER TABLE public.bookings 
ALTER COLUMN technician_id DROP NOT NULL;

-- Add fields for external technician information
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS external_technician_id TEXT,
ADD COLUMN IF NOT EXISTS external_technician_name TEXT,
ADD COLUMN IF NOT EXISTS external_technician_source TEXT DEFAULT 'google_places';

-- Add constraint to ensure either internal or external technician is specified
ALTER TABLE public.bookings 
ADD CONSTRAINT check_technician_specified 
CHECK (
  (technician_id IS NOT NULL) OR 
  (external_technician_id IS NOT NULL AND external_technician_name IS NOT NULL)
);

-- Update RLS policies to handle external technicians
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public booking creation" ON public.bookings;

-- Create comprehensive booking policies
CREATE POLICY "Allow public booking creation" ON public.bookings 
  FOR INSERT 
  TO PUBLIC
  WITH CHECK (true);

-- Allow customers to view their own bookings by email
CREATE POLICY "Customers can view their bookings" ON public.bookings 
  FOR SELECT 
  TO PUBLIC
  USING (customer_email = auth.jwt() ->> 'email');

-- Allow service role full access for admin operations
CREATE POLICY "Service role full access" ON public.bookings 
  FOR ALL 
  TO service_role
  USING (true);

-- Allow technicians to view and update their internal bookings
CREATE POLICY "Technicians can manage their bookings" ON public.bookings 
  FOR ALL 
  USING (
    technician_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.technicians 
      WHERE technicians.id = bookings.technician_id 
      AND technicians.user_id = auth.uid()
    )
  );
