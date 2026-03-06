import mongoose from "mongoose";
const { Schema } = mongoose;

const JournelSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  groupId: { type: Schema.Types.ObjectId, ref: "Group" },
  entryArray: [
    {
      type: Schema.Types.ObjectId,
      ref: "Entry",
    },
  ],

  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export const Journel = mongoose.model("Journel", JournelSchema);
