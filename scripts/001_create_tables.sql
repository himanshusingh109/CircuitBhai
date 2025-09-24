-- Create tables for the e-waste repair website

-- Chat conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT,
  issue_description TEXT,
  ai_response TEXT,
  recommended_videos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.chat_conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
  ON public.chat_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.chat_conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.chat_conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Device repair guides table (for future expansion)
CREATE TABLE IF NOT EXISTS public.repair_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  device_type TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT,
  tools_needed TEXT[],
  steps JSONB,
  youtube_video_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for repair guides (public read access)
ALTER TABLE public.repair_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view repair guides" 
  ON public.repair_guides FOR SELECT 
  TO PUBLIC 
  USING (true);
