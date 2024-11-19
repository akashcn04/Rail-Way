import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Router } from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'TrainWay',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// const pool = require('./db');

app.post('/api/contactus', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contactus (name, email, contact_number, message)
       VALUES (?,?,?,?) RETURNING *`,
      [name, email, phone, message]
    );
    
    if (result?.length > 0) {
      res.status(200).json({ message: 'Message sent successfully!' });
    } else {
      res.status(400).json({ message: 'Failed to insert the data' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//employee data insertion
app.post('/api/Employee', async (req, res) => {
  const {name,position,salary,contact} = req.body;

  const id=uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO Employee (id,name,position,salary,contact)
       VALUES (?,?,?,?,?) RETURNING *`,
      [id,name,position,salary,contact]
    );
    
    if (result?.length > 0) {
      res.status(200).json({ message: 'Message sent successfully!' });
    } else {
      res.status(400).json({ message: 'Failed to insert the data' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Database initialization (previous code remains the same until API Routes)

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, contact, address } = req.body;
  try {
    // Check if user already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (id, name, email, password, contact, address) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [name, email, password, contact, address]
    );

    res.json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, contact, address FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    res.json({ 
      success: true, 
      user: users[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Add a passenger
router.post('/', async (req, res) => {
  const { userId, scheduleId, paymentMethod, transactionId, amount, status } = req.body;

  try {
    const userResult = await db.query('SELECT id, name, email, contact, address FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // Insert user details into the passenger table, excluding password
        await db.query(
            'INSERT INTO passenger (id, name, email, contact, address) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
            [user.id, user.name, user.email, user.contact, user.address]
        );

        res.status(201).json({ message: 'Booking successful and passenger details saved!' });
    } catch (error) {
        console.error('Error booking ticket and saving passenger details:', error);
        res.status(500).json({ message: 'Failed to book ticket and save passenger details' });
    }
});

// Train Routes
app.get('/api/trains', async (req, res) => {
  try {
    const [trains] = await pool.query(
      'SELECT id, name, total_seats, available_seats FROM trains'
    );
    res.json({ success: true, trains });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/trains/:id/schedules', async (req, res) => {
  const { id } = req.params;
  try {
    const [schedules] = await pool.query(
      `SELECT s.*, t.name as train_name, t.available_seats 
       FROM schedules s 
       JOIN trains t ON t.id = s.train_id 
       WHERE t.id = ?`,
      [id]
    );
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Schedule Routes
app.get('/api/schedules', async (req, res) => {
  const { date, from, to } = req.query;
  try {
    let query = `
      SELECT s.*, t.name as train_name, t.available_seats 
      FROM schedules s 
      JOIN trains t ON t.id = s.train_id 
      WHERE DATE(s.departure_time) = ?
    `;
    const params = [date];

    if (from) {
      query += ' AND s.departure_station = ?';
      params.push(from);
    }
    if (to) {
      query += ' AND s.arrival_station = ?';
      params.push(to);
    }

    const [schedules] = await pool.query(query, params);
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Booking Routes
app.post('/api/schedules', async (req, res) => {
  const { userId, scheduleId, paymentMethod } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Check if seats are available and get schedule details
    const [schedules] = await connection.query(
      `SELECT t.id as train_id, t.available_seats, s.price, s.departure_time 
       FROM schedules s 
       JOIN trains t ON t.id = s.train_id 
       WHERE s.id = ? FOR UPDATE`,
      [scheduleId]
    );

    if (schedules.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Schedule not found' 
      });
    }

    const schedule = schedules[0];

    // 2. Validate seats and departure time
    if (schedule.available_seats === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'No seats available' 
      });
    }

    if (new Date(schedule.departure_time) < new Date()) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Train has already departed' 
      });
    }

    // 3. Generate booking ID and PNR
    const bookingId = generateUUID();
    const pnr = `PNR${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // 4. Calculate seat number
    const seatNumber = 30 - schedule.available_seats + 1;

    // 5. Create booking record
    await connection.query(
      `INSERT INTO bookings (id, pnr, user_id, schedule_id, seat_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [bookingId, pnr, userId, scheduleId, `A${seatNumber}`]
    );

    // 6. Create payment record
    await connection.query(
      `INSERT INTO payments (id, booking_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [
        generateUUID(),
        bookingId,
        schedule.price,
        paymentMethod,
        `TXN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      ]
    );

    // 7. Insert passenger details
    const [userResult] = await connection.query(
      'SELECT id, name, email, contact, address FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    const user = userResult[0];

    // Generate a random UUID for the passenger id
    const passengerId = uuidv4();
    
    // Insert user details into the passenger table with the generated id
    await connection.query(
      'INSERT INTO passenger (id, name, email, contact, address) VALUES (?, ?, ?, ?, ?)',
      [passengerId, user.name, user.email, user.contact, user.address]
    );

    // 8. Commit transaction
    await connection.commit();

    // 9. Get complete booking details
    const [bookingDetails] = await connection.query(
      `SELECT b.*, s.departure_station, s.arrival_station, 
              s.departure_time, s.arrival_time, t.name as train_name,
              p.amount, p.payment_method, p.status as payment_status
       FROM bookings b
       JOIN schedules s ON s.id = b.schedule_id
       JOIN trains t ON t.id = s.train_id
       JOIN payments p ON p.booking_id = b.id
       WHERE b.id = ?`,
      [bookingId]
    );

    res.json({ 
      success: true, 
      booking: bookingDetails[0]
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//getting booking info of perticular user
app.get('/api/schedules', async (req, res) => {
  const userId = req.query.user_id;
  
  try {
    const client = await pool.connect();
    const query = 'SELECT username, seat_number, status, created_at FROM bookings WHERE user_id = $1';
    const result = await client.query(query, [userId]);
    client.release();

    const bookings = result.rows;
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Payment Routes
app.get('/api/payments/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [payments] = await pool.query(
      `SELECT p.*, b.pnr, t.name as train_name,
              s.departure_station, s.arrival_station,
              s.departure_time, s.arrival_time
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN schedules s ON s.id = b.schedule_id
       JOIN trains t ON t.id = s.train_id
       WHERE b.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get('/api/bookings', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await db.query('SELECT * FROM bookings WHERE user_id = ?', [user_id]);
    res.status(200).json({ bookings: result });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch booking history' });
  }
});

app.get('/api/pnr/:pnr', async (req, res) => {
  const { pnr } = req.params;

  const query = `
    SELECT
      b.seat_number AS seatNumber,
      b.status,
      s.departure_station AS boardingStation,
      u.name AS passengerName,
      t.name AS trainName
    FROM
      bookings b
    JOIN
      schedules s ON b.schedule_id = s.id
    JOIN
      users u ON b.user_id = u.id
    JOIN
      trains t ON s.train_id = t.id
    WHERE
      b.pnr = ?;
  `;

  try {
    // Use pool.query() for database interaction
    const [results] = await pool.query(query, [pnr]);

    // Check if any result was returned
    if (results.length > 0) {
      // Send the result as the response
      res.json(results[0]);
    } else {
      // If no booking found, send an error response
      res.status(404).json({ success: false, message: 'PNR not found' });
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ success: false, message: 'Database query failed' });
  }
});
