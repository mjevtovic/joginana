-- Seed data for Yoga Studio PWA

-- Insert sample yoga classes
insert into public.classes (title, description, instructor, duration_minutes, difficulty, style, video_url, thumbnail_url, is_premium) values
  (
    'Morning Flow',
    'Start your day with this energizing vinyasa flow. Perfect for waking up the body and setting intentions for the day ahead.',
    'Sarah Chen',
    30,
    'beginner',
    'Vinyasa',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    false
  ),
  (
    'Stress Relief Yoga',
    'Unwind and release tension with this gentle practice focusing on hip openers and restorative poses.',
    'Michael Torres',
    45,
    'beginner',
    'Restorative',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    false
  ),
  (
    'Power Yoga Sculpt',
    'Build strength and endurance with this challenging power yoga session. Expect to sweat!',
    'Jessica Williams',
    60,
    'advanced',
    'Power',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    true
  ),
  (
    'Gentle Stretch',
    'A slow-paced class perfect for beginners or anyone looking for a gentle practice.',
    'Sarah Chen',
    20,
    'beginner',
    'Hatha',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800',
    true
  ),
  (
    'Core Strength Flow',
    'Focus on building a strong core foundation with this targeted practice.',
    'David Park',
    35,
    'intermediate',
    'Vinyasa',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    true
  ),
  (
    'Evening Wind Down',
    'Prepare your body for restful sleep with this calming evening sequence.',
    'Emma Liu',
    25,
    'beginner',
    'Yin',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800',
    true
  ),
  (
    'Hip Opening Journey',
    'Deep stretches for tight hips with plenty of time to breathe and release.',
    'Michael Torres',
    40,
    'intermediate',
    'Yin',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
    true
  ),
  (
    'Balance & Focus',
    'Improve your balance and concentration with standing poses and mindful transitions.',
    'Jessica Williams',
    30,
    'intermediate',
    'Hatha',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800',
    true
  ),
  (
    'Advanced Inversions',
    'Master headstands, handstands, and forearm stands with proper technique and safety.',
    'David Park',
    50,
    'advanced',
    'Vinyasa',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800',
    true
  ),
  (
    'Meditation & Breathwork',
    'Learn pranayama techniques and guided meditation for mental clarity.',
    'Emma Liu',
    20,
    'beginner',
    'Meditation',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1593811167562-9cef47bfc4a7?w=800',
    true
  ),
  (
    'Sun Salutation Basics',
    'Learn the foundation of vinyasa yoga with proper alignment in sun salutations.',
    'Sarah Chen',
    25,
    'beginner',
    'Vinyasa',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1508050249562-b28a87434496?w=800',
    true
  ),
  (
    'Flexibility Flow',
    'Increase your flexibility with this full-body stretching sequence.',
    'Michael Torres',
    45,
    'intermediate',
    'Hatha',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1573384666979-2b1e160d2d08?w=800',
    true
  );
