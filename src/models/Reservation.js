const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: 'Reservation date cannot be in the past'
      }
    },
    timeSlot: {
      from: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/.test(value);
          },
          message: 'Invalid start time format'
        }
      },
      to: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/.test(value);
          },
          message: 'Invalid end time format'
        }
      }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['cancelled', 'paid', 'unpaid', 'pending'],
      default: 'pending'
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['paypal'],
      default: 'paypal'
    },
    notes: {
      type: String,
      default: ''
    },
    transactionId: {
      type: String,
      default: ''
    },
    payerEmail: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// create an index on court, date, and timeSlot to prevent double bookings
reservationSchema.index({ court: 1, date: 1, 'timeSlot.from': 1, 'timeSlot.to': 1 }, { unique: true });

// Pre-save hook to confirm reservation on successful payment
reservationSchema.pre('save', function (next) {
  if (this.paymentStatus === 'paid') {
    this.status = 'confirmed';
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
