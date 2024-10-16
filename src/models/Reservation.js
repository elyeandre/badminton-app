const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the User who made the reservation
      required: true
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court', // reference to the Court being reserved
      required: true
    },
    date: {
      type: Date, // reservation date
      required: true
    },
    timeSlot: {
      from: {
        type: String, // start time of the reservation (e.g., '09:00 AM')
        required: true
      },
      to: {
        type: String, // end time of the reservation (e.g., '11:00 AM')
        required: true
      }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'], // status of the reservation
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['cancelled', 'paid', 'unpaid', 'pending'], // status of payment for the reservation
      default: 'pending'
    },
    totalAmount: {
      type: Number, // total amount for the reservation based on the court's hourly rate
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['paypal'],
      default: 'paypal'
    },
    notes: {
      type: String, // additional notes for the reservation
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// create an index on date and timeSlot to prevent double bookings
reservationSchema.index({ court: 1, date: 1, 'timeSlot.from': 1, 'timeSlot.to': 1 }, { unique: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
