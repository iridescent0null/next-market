import mongoose from "mongoose";
import Config from "./config";

const URL = `mongodb+srv://${Config.mongoDB.user}:${Config.mongoDB.password}@cluster0.9blrk.mongodb.net/${Config.mongoDB.DbName}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
    try {
        await mongoose.connect(URL);
        console.log("Success: Connected to MongoDB");
    } catch(err) {
        console.log("Failure: Not connected to MongoDB");
        throw new Error();
    }
};

export default connectDB;