const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long']
    },
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
      validate: {
        validator: function (value) {
          const validDomains = ['gmail.com', 'yahoo.com', 'googlemail.com'];
          const domain = value.split('@')[1];
          return validDomains.includes(domain);
        },
        message: 'Email must be from Gmail, Yahoo, or Googlemail.'
      }
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 4 characters long']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);
        },
        message: 'Password must be stronger (contain upper/lower case letters, numbers, and special characters).'
      },
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
    verificationNonce: {
      type: String,
      default: null
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
    refreshToken: {
      type: String,
      default: null // store refresh token here
    },
    resetPasswordNonce: {
      type: String,
      default: null
    },
    profile_photo: {
      type: String,
      default: '/assets/images/blank-profile.png'
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
    timestamps: true,
    strict: 'throw'
  }
);

// Apply toJSON transformation to exclude sensitive fields
userSchema.set('toJSON', {
  virtuals: true, // Include virtual fields
  transform: function (doc, ret, options) {
    // Remove fields like password, otp, refreshToken, etc.

    delete ret.password;
    delete ret.refreshToken;
    delete ret.otp;
    delete ret.otpExpires;
    delete ret.__v;
    delete ret._id;
    delete ret.verificationNonce;
    delete ret.resetPasswordNonce;

    // return only specific fields or modify structure
    return ret;
  }
});

// add a pre-save hook to set isVerified to false when the email is updated
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.isVerified = false; // Set isVerified to false
  }
  next();
});

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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema
  .virtual('confirm_password')
  .get(function () {
    return this._confirm_password;
  })
  .set(function (value) {
    this._confirm_password = value;
  });

// pre-validate hook to ensure password confirmation matches
userSchema.pre('validate', function (next) {
  if (this.password !== this.confirm_password) {
    this.invalidate('confirm_password', 'Passwords do not match');
  }
  next();
});

userSchema.methods.generateToken = function (type) {
  const payload = {
    id: this._id,
    role: this.role
  };

  if (type === 'access') {
    // Generate an access token (short-lived)
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m', algorithm: 'HS256' });
  }

  if (type === 'refresh') {
    // Generate a refresh token (long-lived)
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '14d', algorithm: 'HS256' });
  }

  throw new Error('Invalid token type');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
