-- Create tables for technician marketplace functionality

-- Technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_address TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  experience_years INTEGER,
  license_number TEXT,
  certifications TEXT[],
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technician services table
CREATE TABLE IF NOT EXISTS public.technician_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  device_types TEXT[] NOT NULL,
  estimated_duration TEXT,
  price_range TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  preferred_time TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  booking_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for technicians
CREATE POLICY "Anyone can view approved technicians" 
  ON public.technicians FOR SELECT 
  TO PUBLIC 
  USING (status = 'approved');

CREATE POLICY "Technicians can view their own profile" 
  ON public.technicians FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Technicians can update their own profile" 
  ON public.technicians FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can register as technician" 
  ON public.technicians FOR INSERT 
  TO PUBLIC 
  WITH CHECK (true);

-- RLS policies for technician services
CREATE POLICY "Anyone can view services from approved technicians" 
  ON public.technician_services FOR SELECT 
  TO PUBLIC 
  USING (
    EXISTS (
      SELECT 1 FROM public.technicians 
      WHERE technicians.id = technician_services.technician_id 
      AND technicians.status = 'approved'
    )
  );

CREATE POLICY "Technicians can manage their own services" 
  ON public.technician_services FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.technicians 
      WHERE technicians.id = technician_services.technician_id 
      AND technicians.user_id = auth.uid()
    )
  );

-- RLS policies for bookings
CREATE POLICY "Anyone can create bookings" 
  ON public.bookings FOR INSERT 
  TO PUBLIC 
  WITH CHECK (true);

CREATE POLICY "Technicians can view their bookings" 
  ON public.bookings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.technicians 
      WHERE technicians.id = bookings.technician_id 
      AND technicians.user_id = auth.uid()
    )
  );

CREATE POLICY "Technicians can update their bookings" 
  ON public.bookings FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.technicians 
      WHERE technicians.id = bookings.technician_id 
      AND technicians.user_id = auth.uid()
    )
  );

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews FOR SELECT 
  TO PUBLIC 
  USING (true);

CREATE POLICY "Anyone can create reviews" 
  ON public.reviews FOR INSERT 
  TO PUBLIC 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_specialties ON public.technicians USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_bookings_technician_id ON public.bookings(technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_technician_id ON public.reviews(technician_id);

-- Function to update technician rating when new review is added
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.technicians 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM public.reviews 
      WHERE technician_id = NEW.technician_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE technician_id = NEW.technician_id
    )
  WHERE id = NEW.technician_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update ratings
CREATE TRIGGER trigger_update_technician_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_rating();
