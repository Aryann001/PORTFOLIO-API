import mongoose from "mongoose";

const DB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: "Portfolio",
    })
    .then((data) => console.log(`DB is connect to ${data.connection.host}`));
};

export default DB;
