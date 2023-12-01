import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Enter a Validte email"],
  },
  password: {
    type: String,
    required: true,
    select: false,
    minLength: [8, "Password Should be Greater than 8 character"],
  },
  role: {
    type: String,
    default: "user",
  },

  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  techStack: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  aboutMe: {
    heading: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },
  },

  projects: [
    {
      image: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      stack: [
        {
          stackStr: { type: String, required: true },
        },
      ],
      github: {
        type: String,
        required: true,
      },
      projectLink: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordOtp: Number,
  resetPasswordOtpExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 1000 * 60 * 60 * 24 * process.env.JWT_EXPIRES,
  });
};

export default mongoose.model("User", userSchema);
