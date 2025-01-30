import express from "express"
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/mongodb.js"
import { authRouter } from "./routes/authRoutes.js"


const app=express();
const PORT= process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))




//api endpoints
app.use("/api/auth",authRouter)


app.get("/",(req,res)=>{
    res.send("working")
})
app.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`)
})