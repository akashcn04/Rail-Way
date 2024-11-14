CREATE DATABASE IF NOT EXISTS TrainWay;
USE TrainWay;

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trains table
CREATE TABLE trains (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules table
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  train_id VARCHAR(36) NOT NULL,
  departure_station VARCHAR(100) NOT NULL,
  arrival_station VARCHAR(100) NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (train_id) REFERENCES trains(id)
);

-- Bookings table
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  pnr VARCHAR(10) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  schedule_id VARCHAR(36) NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);

-- Payments table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  status ENUM('completed', 'pending', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- History table for tracking all actions
CREATE TABLE history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action_type ENUM('booking', 'cancellation', 'payment', 'refund', 'modification') NOT NULL,
  reference_id VARCHAR(36) NOT NULL,
  description TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE Employee (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    salary DECIMAL(10, 2),
    contact VARCHAR(15)
);


-- Refunds table
-- CREATE TABLE refunds (
--   id VARCHAR(36) PRIMARY KEY,
--   payment_id VARCHAR(36) NOT NULL,
--   amount DECIMAL(10, 2) NOT NULL,
--   status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
--   reason TEXT NOT NULL,
--   processed_at TIMESTAMP,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (payment_id) REFERENCES payments(id)
-- );

CREATE TABLE stations (
    id   VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    facilities TEXT,
    contact VARCHAR(20),
    timing VARCHAR(50)  
);

DELIMITER //

-- Trigger to update available seats after booking
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  -- Update train seats
  UPDATE trains t
  JOIN schedules s ON s.train_id = t.id
  SET t.available_seats = t.available_seats - 1
  WHERE s.id = NEW.schedule_id
  AND NEW.status = 'confirmed';
  
  -- Add to history
  INSERT INTO history (id, user_id, action_type, reference_id, description, metadata)
  VALUES (
    UUID(),
    NEW.user_id,
    'booking',
    NEW.id,
    CONCAT('New booking created with PNR: ', NEW.pnr),
    JSON_OBJECT(
      'pnr', NEW.pnr,
      'seat_number', NEW.seat_number,
      'status', NEW.status
    )
  );
END//

-- Trigger to update available seats after cancellation
CREATE TRIGGER after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    -- Update train seats
    UPDATE trains t
    JOIN schedules s ON s.train_id = t.id
    SET t.available_seats = t.available_seats + 1
    WHERE s.id = NEW.schedule_id;
    
    -- Add to history
    INSERT INTO history (id, user_id, action_type, reference_id, description, metadata)
    VALUES (
      UUID(),
      NEW.user_id,
      'cancellation',
      NEW.id,
      CONCAT('Booking cancelled for PNR: ', NEW.pnr),
      JSON_OBJECT(
        'pnr', NEW.pnr,
        'previous_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
END//

-- Trigger to track payment status changes
CREATE TRIGGER after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  INSERT INTO history (id, user_id, action_type, reference_id, description, metadata)
  SELECT 
    UUID(),
    b.user_id,
    'payment',
    NEW.id,
    CONCAT('Payment ', NEW.status, ' for booking'),
    JSON_OBJECT(
      'amount', NEW.amount,
      'payment_method', NEW.payment_method,
      'status', NEW.status,
      'transaction_id', NEW.transaction_id
    )
  FROM bookings b
  WHERE b.id = NEW.booking_id;
END//

-- Trigger to track refund status changes
-- CREATE TRIGGER after_refund_insert
-- AFTER INSERT ON refunds
-- FOR EACH ROW
-- BEGIN
--   INSERT INTO history (id, user_id, action_type, reference_id, description, metadata)
--   SELECT 
--     UUID(),
--     b.user_id,
--     'refund',
--     NEW.id,
--     CONCAT('Refund ', NEW.status, ' for payment'),
--     JSON_OBJECT(
--       'amount', NEW.amount,
--       'status', NEW.status,
--       'reason', NEW.reason
--     )
--   FROM payments p
--   JOIN bookings b ON b.id = p.booking_id
--   WHERE p.id = NEW.payment_id;
-- END//

-- Stored procedure for booking a ticket
CREATE PROCEDURE book_ticket(
  IN p_user_id VARCHAR(36),
  IN p_schedule_id VARCHAR(36),
  IN p_payment_method VARCHAR(50)
)
BEGIN
  DECLARE v_booking_id VARCHAR(36);
  DECLARE v_payment_id VARCHAR(36);
  DECLARE v_price DECIMAL(10, 2);
  DECLARE v_pnr VARCHAR(10);
  
  -- Start transaction
  START TRANSACTION;
  
  -- Get price from schedule
  SELECT price INTO v_price
  FROM schedules
  WHERE id = p_schedule_id;
  
  -- Generate PNR
  SET v_pnr = CONCAT('PNR', LPAD(FLOOR(RAND() * 1000000), 6, '0'));
  
  -- Generate UUIDs
  SET v_booking_id = UUID();
  SET v_payment_id = UUID();
  
  -- Create booking
  INSERT INTO bookings (id, pnr, user_id, schedule_id, seat_number)
  VALUES (v_booking_id, v_pnr, p_user_id, p_schedule_id, 'AUTO');
  
  -- Create payment
  INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id)
  VALUES (
    v_payment_id,
    v_booking_id,
    v_price,
    p_payment_method,
    CONCAT('TXN', LPAD(FLOOR(RAND() * 1000000), 6, '0'))
  );
  
  -- Commit transaction
  COMMIT;
  
  -- Return booking details
  SELECT b.*, p.amount, p.payment_method, p.status as payment_status
  FROM bookings b
  JOIN payments p ON p.booking_id = b.id
  WHERE b.id = v_booking_id;
END//

-- Function to get PNR status
CREATE FUNCTION get_pnr_status(p_pnr VARCHAR(10))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
  DECLARE v_status VARCHAR(50);
  
  SELECT 
    CASE
      WHEN b.status = 'cancelled' THEN 'Cancelled'
      WHEN b.status = 'confirmed' AND s.departure_time > NOW() THEN 'Confirmed'
      WHEN b.status = 'confirmed' AND s.departure_time <= NOW() THEN 'Completed'
      ELSE 'Not Found'
    END INTO v_status
  FROM bookings b
  JOIN schedules s ON s.id = b.schedule_id
  WHERE b.pnr = p_pnr;
  
  RETURN COALESCE(v_status, 'Not Found');
END//

-- Stored procedure to process refund
CREATE PROCEDURE process_refund(
  IN p_booking_id VARCHAR(36),
  IN p_reason TEXT
)
BEGIN
  DECLARE v_payment_id VARCHAR(36);
  DECLARE v_amount DECIMAL(10, 2);
  
  -- Start transaction
  START TRANSACTION;
  
  -- Get payment details
  SELECT id, amount INTO v_payment_id, v_amount
  FROM payments
  WHERE booking_id = p_booking_id
  AND status = 'completed'
  LIMIT 1;
  
  IF v_payment_id IS NOT NULL THEN
    -- Create refund record
    INSERT INTO refunds (id, payment_id, amount, reason)
    VALUES (UUID(), v_payment_id, v_amount, p_reason);
    
    -- Update payment status
    UPDATE payments
    SET status = 'refunded'
    WHERE id = v_payment_id;
  END IF;
  
  -- Commit transaction
  COMMIT;
END//

DELIMITER ;

-- Inserting data for trains and schedules
INSERT INTO trains (id, name, total_seats, available_seats) VALUES
(UUID(), 'Express 101', 30, 30),
(UUID(), 'Superfast 202', 30, 30),
(UUID(), 'Lightning 303', 30, 30),
(UUID(), 'Thunder 404', 30, 30),
(UUID(), 'Bullet 505', 30, 30);

INSERT INTO schedules (id, train_id, departure_station, arrival_station, departure_time, arrival_time, price) VALUES
(UUID(), (SELECT id FROM trains WHERE name = 'Express 101'), 'Bengaluru', 'Mysore', TIMESTAMP(CURDATE() + INTERVAL 9 HOUR), TIMESTAMP(CURDATE() + INTERVAL 12 HOUR), 2500.00),
(UUID(), (SELECT id FROM trains WHERE name = 'Superfast 202'), 'Bengaluru', 'Mysore', TIMESTAMP(CURDATE() + INTERVAL 10 HOUR), TIMESTAMP(CURDATE() + INTERVAL 13 HOUR), 2500.00),
(UUID(), (SELECT id FROM trains WHERE name = 'Lightning 303'), 'Bengaluru', 'Mysore', TIMESTAMP(CURDATE() + INTERVAL 11 HOUR), TIMESTAMP(CURDATE() + INTERVAL 14 HOUR), 2500.00),
(UUID(), (SELECT id FROM trains WHERE name = 'Thunder 404'), 'Bengaluru', 'Mysore', TIMESTAMP(CURDATE() + INTERVAL 12 HOUR), TIMESTAMP(CURDATE() + INTERVAL 15 HOUR), 2500.00),
(UUID(), (SELECT id FROM trains WHERE name = 'Bullet 505'), 'Bengaluru', 'Mysore', TIMESTAMP(CURDATE() + INTERVAL 13 HOUR), TIMESTAMP(CURDATE() + INTERVAL 16 HOUR), 2500.00);


