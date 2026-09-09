/**
 * links: one or more { company, accessRole } pairs — a user can
 * act on behalf of more than one company (e.g. export team in
 * Brazil + import team in the US). See README > Users linked to
 * multiple companies. Password is hashed before save and
 * excluded from query results and JSON output.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userLinkSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  accessRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccessRole",
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    links: {
      type: [userLinkSchema],
      required: true,
      validate: (links) => links.length > 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);