import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDbPath = path.resolve(__dirname, '../data/db.json');

// Mongoose Schemas (Only used when MongoDB is connected)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  favoriteBeaches: [String],
  favoriteDistricts: [String]
});

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['hotel', 'activity'], required: true },
  itemName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String },
  quantity: { type: Number, required: true },
  contactDetails: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  price: { type: Number },
  status: { type: String, default: 'Confirmed' },
  bookingDate: { type: Date, default: Date.now },
  // Payment fields
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], default: 'upi' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderId: { type: String },
  paymentId: { type: String },
  paymentAmount: { type: Number },
  paymentCurrency: { type: String, default: 'INR' }
});

let UserModel;
let BookingModel;
let isMongo = false;

// Custom file-based DB methods
function readJsonDb() {
  try {
    const data = fs.readFileSync(jsonDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON database, returning empty template:", err);
    return { districts: [], beaches: [], hotels: [], restaurants: [], activities: [], guides: [], bookings: [], users: [] };
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing JSON database:", err);
  }
}

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("🌐 Connected to MongoDB successfully!");
      UserModel = mongoose.model('User', UserSchema);
      BookingModel = mongoose.model('Booking', BookingSchema);
      isMongo = true;
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
      console.log("⚠️ Falling back to local JSON File Database...");
      isMongo = false;
    }
  } else {
    console.log("ℹ️ No MONGODB_URI environment variable detected. Using local JSON File Database.");
    isMongo = false;
  }
}

// Database Operations Wrapper
export const db = {
  // Districts
  async getDistricts() {
    const localData = readJsonDb();
    return localData.districts;
  },

  async getDistrictById(id) {
    const localData = readJsonDb();
    return localData.districts.find(d => d.id === id);
  },

  // Beaches
  async getBeaches() {
    const localData = readJsonDb();
    return localData.beaches;
  },

  async getBeachById(id) {
    const localData = readJsonDb();
    return localData.beaches.find(b => b.id === id);
  },

  async getBeachesByDistrict(districtId) {
    const localData = readJsonDb();
    return localData.beaches.filter(b => b.districtId === districtId);
  },

  // Hotels
  async getHotelsByBeach(beachId) {
    const localData = readJsonDb();
    return localData.hotels.filter(h => h.beachId === beachId);
  },

  // Restaurants
  async getRestaurantsByBeach(beachId) {
    const localData = readJsonDb();
    return localData.restaurants.filter(r => r.beachId === beachId);
  },

  // Activities
  async getActivitiesByBeach(beachId) {
    const localData = readJsonDb();
    return localData.activities.filter(a => a.beachId === beachId);
  },

  // Guides
  async getGuidesByDistrict(districtId) {
    const localData = readJsonDb();
    return localData.guides.filter(g => g.districtId === districtId);
  },

  // Users & Auth
  async createUser(userData) {
    if (isMongo) {
      const user = new UserModel(userData);
      const savedUser = await user.save();
      return { id: savedUser._id.toString(), ...userData, password: '' };
    } else {
      const data = readJsonDb();
      const newUser = {
        id: 'u_' + Date.now() + Math.random().toString(36).substring(2, 5),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        favoriteBeaches: [],
        favoriteDistricts: []
      };
      data.users.push(newUser);
      writeJsonDb(data);
      return { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone };
    }
  },

  async findUserByEmail(email) {
    if (isMongo) {
      const user = await UserModel.findOne({ email });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password,
        favoriteBeaches: user.favoriteBeaches || [],
        favoriteDistricts: user.favoriteDistricts || []
      };
    } else {
      const data = readJsonDb();
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async findUserById(id) {
    if (isMongo) {
      const user = await UserModel.findById(id);
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        favoriteBeaches: user.favoriteBeaches || [],
        favoriteDistricts: user.favoriteDistricts || []
      };
    } else {
      const data = readJsonDb();
      const user = data.users.find(u => u.id === id);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        favoriteBeaches: user.favoriteBeaches || [],
        favoriteDistricts: user.favoriteDistricts || []
      };
    }
  },

  // Favorites
  async toggleFavoriteBeach(userId, beachId) {
    if (isMongo) {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error("User not found");
      const index = user.favoriteBeaches.indexOf(beachId);
      if (index === -1) {
        user.favoriteBeaches.push(beachId);
      } else {
        user.favoriteBeaches.splice(index, 1);
      }
      await user.save();
      return user.favoriteBeaches;
    } else {
      const data = readJsonDb();
      const user = data.users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      if (!user.favoriteBeaches) user.favoriteBeaches = [];
      const index = user.favoriteBeaches.indexOf(beachId);
      if (index === -1) {
        user.favoriteBeaches.push(beachId);
      } else {
        user.favoriteBeaches.splice(index, 1);
      }
      writeJsonDb(data);
      return user.favoriteBeaches;
    }
  },

  async toggleFavoriteDistrict(userId, districtId) {
    if (isMongo) {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error("User not found");
      const index = user.favoriteDistricts.indexOf(districtId);
      if (index === -1) {
        user.favoriteDistricts.push(districtId);
      } else {
        user.favoriteDistricts.splice(index, 1);
      }
      await user.save();
      return user.favoriteDistricts;
    } else {
      const data = readJsonDb();
      const user = data.users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      if (!user.favoriteDistricts) user.favoriteDistricts = [];
      const index = user.favoriteDistricts.indexOf(districtId);
      if (index === -1) {
        user.favoriteDistricts.push(districtId);
      } else {
        user.favoriteDistricts.splice(index, 1);
      }
      writeJsonDb(data);
      return user.favoriteDistricts;
    }
  },

  // Bookings
  async createBooking(bookingData) {
    if (isMongo) {
      const booking = new BookingModel(bookingData);
      const savedBooking = await booking.save();
      return savedBooking;
    } else {
      const data = readJsonDb();
      const newBooking = {
        id: 'bk_' + Date.now() + Math.random().toString(36).substring(2, 5),
        userId: bookingData.userId,
        type: bookingData.type,
        itemName: bookingData.itemName,
        date: bookingData.date,
        time: bookingData.time || '',
        quantity: Number(bookingData.quantity),
        contactDetails: bookingData.contactDetails || {},
        price: Number(bookingData.price || 0),
        status: bookingData.status || 'Confirmed',
        bookingDate: new Date().toISOString(),
        paymentMethod: bookingData.paymentMethod || 'upi',
        paymentStatus: bookingData.paymentStatus || 'pending',
        orderId: bookingData.orderId || '',
        paymentId: bookingData.paymentId || '',
        paymentAmount: Number(bookingData.paymentAmount || bookingData.price || 0),
        paymentCurrency: bookingData.paymentCurrency || 'INR'
      };
      if (!data.bookings) data.bookings = [];
      data.bookings.push(newBooking);
      writeJsonDb(data);
      return newBooking;
    }
  },

  async getBookingsByUser(userId) {
    if (isMongo) {
      const list = await BookingModel.find({ userId }).sort({ bookingDate: -1 });
      return list.map(b => ({
        id: b._id.toString(),
        userId: b.userId,
        type: b.type,
        itemName: b.itemName,
        date: b.date,
        time: b.time,
        quantity: b.quantity,
        contactDetails: b.contactDetails,
        price: b.price,
        status: b.status,
        bookingDate: b.bookingDate,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        orderId: b.orderId,
        paymentId: b.paymentId,
        paymentAmount: b.paymentAmount,
        paymentCurrency: b.paymentCurrency
      }));
    } else {
      const data = readJsonDb();
      const bookings = data.bookings || [];
      return bookings
        .filter(b => b.userId === userId)
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    }
  }
};
