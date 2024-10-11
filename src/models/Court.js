const mongoose = require('mongoose');

const courtRegistrationSchema = new mongoose.Schema({
  business_name: {
    type: String,
    trim: true,
    default: ''
  },
  contact_number: {
    type: String,
    match: [/^\d{10,15}$/, 'Please enter a valid contact number'],
    default: ''
  },
  business_email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function (value) {
        const validDomains = ['gmail.com', 'yahoo.com', 'googlemail.com'];
        const domain = value.split('@')[1];
        return validDomains.includes(domain);
      },
      message: 'Email must be from Gmail, Yahoo, or Googlemail.'
    },
    default: ''
  },
  operating_hours: {
    from: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  },
  hourly_rate: {
    type: Number,
    min: [0, 'Hourly rate must be a positive number'],
    default: 0
  },
  business_logo: {
    type: String,
    default: ''
  },
  court_images: {
    type: [String],
    default: []
  },
  facility_images: {
    type: [String],
    default: []
  },
  paypal_email: {
    type: String,
    default: ''
  },
  documents: {
    business_permit: {
      type: String,
      default: ''
    },
    dti: {
      type: String,
      default: ''
    },
    bir: {
      type: String,
      default: ''
    },
    sanitary_permit: {
      type: String,
      default: ''
    },
    barangay_clearance: {
      type: String,
      default: ''
    },
    non_coverage: {
      type: String,
      default: ''
    },
    dole_registration: {
      type: String,
      default: ''
    }
  },
  description: {
    type: String,
    default: ''
  }
});

const Court = mongoose.model('Court', courtRegistrationSchema);
module.exports = Court;
