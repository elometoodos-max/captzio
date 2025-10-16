-- Insert default system configuration
insert into public.system_config (key, value, description) values
  ('caption_cost', '1', 'Credits cost per caption generation'),
  ('image_cost', '5', 'Credits cost per image generation'),
  ('openai_model_caption', '"gpt-4o-mini"', 'OpenAI model for caption generation'),
  ('openai_model_image', '"dall-e-3"', 'OpenAI model for image generation'),
  ('max_caption_length', '500', 'Maximum caption length in characters'),
  ('max_hashtags', '30', 'Maximum number of hashtags'),
  ('rate_limit_caption', '10', 'Caption generation rate limit per hour'),
  ('rate_limit_image', '5', 'Image generation rate limit per hour')
on conflict (key) do nothing;

-- Insert pricing tiers (for reference)
insert into public.system_config (key, value, description) values
  ('pricing_tiers', 
   '[
     {"name": "Básico", "credits": 50, "price": 19.90, "bonus": 0},
     {"name": "Profissional", "credits": 150, "price": 49.90, "bonus": 10},
     {"name": "Empresarial", "credits": 500, "price": 149.90, "bonus": 50}
   ]'::jsonb,
   'Available pricing tiers')
on conflict (key) do nothing;
