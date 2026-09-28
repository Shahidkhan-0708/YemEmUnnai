-- Add geo-coordinates and campus location metadata to vendors
alter table public.vendors 
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_landmark text,
  add column if not exists is_on_campus boolean default true;

-- Update existing vendors with MITS campus coordinates
update public.vendors 
   set latitude = 13.6289, 
       longitude = 78.5022, 
       location_landmark = 'Campus Food Court, Ground Floor',
       is_on_campus = true
 where name ilike '%canteen%';

update public.vendors 
   set latitude = 13.6284, 
       longitude = 78.5016, 
       location_landmark = 'Opposite Central Library',
       is_on_campus = true
 where name ilike '%chai%' or name ilike '%nescafe%';

update public.vendors 
   set latitude = 13.6315, 
       longitude = 78.5060, 
       location_landmark = 'Angallu Main Road, 400m from Gate 1',
       is_on_campus = false
 where name ilike '%royal%';
