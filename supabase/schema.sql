-- SQL Schema for Cal AI Clone

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Profile Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 3. Daily Goals Table
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    calorie_goal INTEGER DEFAULT 2000 NOT NULL,
    protein_goal INTEGER DEFAULT 150 NOT NULL,
    carb_goal INTEGER DEFAULT 200 NOT NULL,
    fat_goal INTEGER DEFAULT 65 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for daily_goals table
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" 
    ON public.daily_goals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own goals" 
    ON public.daily_goals FOR ALL 
    USING (auth.uid() = user_id);

-- 4. Meals Table
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for meals table
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meals" 
    ON public.meals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update/delete their own meals" 
    ON public.meals FOR ALL 
    USING (auth.uid() = user_id);

-- 5. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_logged_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for streaks table
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streak" 
    ON public.streaks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own streak" 
    ON public.streaks FOR ALL 
    USING (auth.uid() = user_id);

-- 6. Trigger to automatically create a users profile & initial goals/streak on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile
    INSERT INTO public.users (id, email, name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'User'));

    -- Insert default daily goals
    INSERT INTO public.daily_goals (user_id, calorie_goal, protein_goal, carb_goal, fat_goal)
    VALUES (new.id, 2000, 150, 200, 65);

    -- Insert default streak record
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (new.id, 0, 0);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Storage Bucket Setup
-- Note: Create a public bucket named "meal-images" in the Supabase Dashboard Storage section.
