import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET ALL DISTRICTS
router.get('/districts', async (req, res) => {
  try {
    const list = await db.getDistricts();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// GET DISTRICT DETAILS & BEACHES
router.get('/districts/:id', async (req, res) => {
  try {
    const district = await db.getDistrictById(req.params.id);
    if (!district) return res.status(404).json({ error: 'District not found' });

    const beaches = await db.getBeachesByDistrict(req.params.id);
    res.json({ district, beaches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch district details' });
  }
});

// GET ALL BEACHES
router.get('/beaches', async (req, res) => {
  try {
    const list = await db.getBeaches();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beaches' });
  }
});

// GET BEACH DETAILS (Explore More)
router.get('/beaches/:id', async (req, res) => {
  try {
    const beach = await db.getBeachById(req.params.id);
    if (!beach) return res.status(404).json({ error: 'Beach not found' });

    const hotels = await db.getHotelsByBeach(req.params.id);
    const restaurants = await db.getRestaurantsByBeach(req.params.id);
    const activities = await db.getActivitiesByBeach(req.params.id);
    const guides = await db.getGuidesByDistrict(beach.districtId);

    // Nearby suggestions: Beaches in the same district, excluding this one
    const allBeaches = await db.getBeachesByDistrict(beach.districtId);
    const nearby = allBeaches.filter(b => b.id !== beach.id);

    res.json({
      beach,
      hotels,
      restaurants,
      activities,
      guides,
      nearby
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beach details' });
  }
});

// SUBMIT BOOKING (Secure)
router.post('/book', authenticateToken, async (req, res) => {
  const { type, itemName, date, time, quantity, contactDetails, price } = req.body;

  if (!type || !itemName || !date || !quantity || !contactDetails) {
    return res.status(400).json({ error: 'Incomplete booking data. Please provide type, name, date, quantity and contacts.' });
  }

  try {
    const booking = await db.createBooking({
      userId: req.user.id,
      type,
      itemName,
      date,
      time,
      quantity,
      contactDetails,
      price
    });
    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (err) {
    console.error('Booking submission error:', err);
    res.status(500).json({ error: 'Failed to process booking' });
  }
});

// GET USER BOOKINGS (Secure)
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const list = await db.getBookingsByUser(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
});

export default router;
