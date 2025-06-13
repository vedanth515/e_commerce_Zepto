// import mongoose from "mongoose";

// const connectDB = async () =>{
//     try{
//         mongoose.connection.on('connected',()=>console.log("Database Connected"));
        
//         await mongoose.connect(`${process.env.MONGODB_URL}/ZiplyCart`)
//     }
//     catch(error){
//        console.error(error.message);
       
//     }
// }
// export default connectDB;




import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/ZiplyCart`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB Connected Successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err);
    });
  } catch (error) {
    console.error("❌ Initial DB Connection Error:", error.message);
  }
};

export default connectDB;
