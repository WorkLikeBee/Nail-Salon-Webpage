CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_from INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(200) NOT NULL,
    client_phone VARCHAR(20),
    service_id INTEGER REFERENCES services(id),
    technician_id INTEGER REFERENCES technicians(id),
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Seed technicians (update names to match your real staff)
INSERT INTO technicians (name, specialty) VALUES
    ('Any Available', 'All Services'),
    ('Lisa', 'Manicures & Nail Art'),
    ('Jenny', 'Pedicures & Spa'),
    ('Mia', 'Nail Enhancements'),
    ('Tina', 'Waxing Services')
ON CONFLICT DO NOTHING;

-- Seed services (matches services.ejs)
INSERT INTO services (name, category, price_from, duration_minutes) VALUES
    ('Classic Manicure', 'Manicures', 25, 45),
    ('Classic Deluxe Manicure', 'Manicures', 35, 60),
    ('Spa Manicure Exfoliating', 'Manicures', 45, 75),
    ('Dipping Powder', 'Nail Enhancements', 49, 75),
    ('Acrylic Set', 'Nail Enhancements', 51, 90),
    ('Builder Gel Set', 'Nail Enhancements', 62, 90),
    ('Hybrid Gel', 'Nail Enhancements', 62, 90),
    ('Classic Pedicure', 'Pedicures', 37, 45),
    ('Classic Deluxe Pedicure', 'Pedicures', 49, 60),
    ('Detox Spa Pedicure', 'Pedicures', 55, 75),
    ('Relaxing Jelly Spa', 'Pedicures', 59, 75),
    ('Ultimate Organic Collagen Pedicure', 'Pedicures', 65, 90),
    ('Ultimate Volcano Pedicure', 'Pedicures', 70, 90),
    ('Eyebrows Wax', 'Waxing', 14, 20),
    ('Lip Wax', 'Waxing', 10, 15),
    ('Chin Wax', 'Waxing', 10, 15),
    ('Underarm Wax', 'Waxing', 27, 30),
    ('Bikini Wax', 'Waxing', 52, 45),
    ('Full Leg Wax', 'Waxing', 72, 60),
    ('Half Leg Wax', 'Waxing', 45, 45),
    ('Full Arm Wax', 'Waxing', 32, 40),
    ('Facial Wax', 'Waxing', 52, 40),
    ('Eyelash', 'Waxing', 45, 30),
    ('Eyebrows Color', 'Waxing', 30, 30)
ON CONFLICT DO NOTHING;
