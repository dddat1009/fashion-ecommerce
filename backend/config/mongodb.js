import mongoose from "mongoose";
import dns from "node:dns"; 
const connectDB = async () => {

    dns.setServers(['8.8.8.8', '1.1.1.1']);

    mongoose.connection.on('connected',() => {
        console.log("DB Connected");
    })

    mongoose.connection.on('error', (err) => {
        console.error("DB Connection Error: ", err);
    })

    mongoose.connection.on('disconnected', () => {
        console.log("DB Disconnected");
    })

   await mongoose.connect(process.env.MONGODB_URI);

}

export default connectDB;