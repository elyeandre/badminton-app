const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long']
    },
    // TODO: Unsure if middleName should be required, as not everyone has a middle name.
    middle_name: {
      type: String,
      trim: true,
      default: ''
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email address']
      // TODO: Add validation to allow only Gmail, Yahoo, and Googlemail addresses.
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 4 characters long']
    },
    // TODO: check if the string can be considered a strong password or not
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false //prevents password from being returned in queries
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female'],
        message: 'Gender must be either Male or Female.'
      }
    },
    date_of_birth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    municipality: {
      type: String,
      required: [true, 'Municipality is required'],
      trim: true
    },
    contact_number: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10,15}$/, 'Please enter a valid contact number']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'player', 'coach'],
        message: 'Role must be either Admin, Player, or Coach.'
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: Number,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
    status_owner: {
      type: String,
      enum: ['single', 'married', 'widowed/er', 'separated', 'cohabitant'],
      validate: {
        validator: function (value) {
          if (this.role !== 'admin' && value) {
            return false; // Only allow status_owner for Admin role
          }
          return true;
        },
        message: 'Status is only allowed for Admins.'
      }
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('validate', function (next) {
  const lowercaseFields = ['gender', 'role', 'status_owner'];

  lowercaseFields.forEach((field) => {
    if (this[field]) {
      this[field] = this[field].toLowerCase();
    }
  });

  next();
});

// hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
