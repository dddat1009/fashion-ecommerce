import mongoose from "mongoose";
import dns from "node:dns"; 
const connectDB = async () => {

    dns.setServers(['8.8.8.8', '1.1.1.1']);

    mongoose.connection.on('connected',() => {
        console.log("DB Connected");
    })

   await mongoose.connect(process.env.MONGODB_URI);

}

export default connectDB;