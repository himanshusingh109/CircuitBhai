-- Update RLS policies for bookings table to allow public booking creation
-- while still protecting data access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public booking creation" ON bookings;
DROP POLICY IF EXISTS "Allow users to view their own bookings" ON bookings;

-- Create new policies
-- Allow anyone to create bookings (for public booking form)
CREATE POLICY "Allow public booking creation" ON bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view bookings associated with their email
CREATE POLICY "Allow users to view their own bookings" ON bookings 
  FOR SELECT 
  USING (customer_email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');

-- Allow service role to manage all bookings (for admin operations)
CREATE POLICY "Allow service role full access" ON bookings 
  FOR ALL 
  USING (auth.role() = 'service_role');
