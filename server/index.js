import express from "express"
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/mongodb.js"
import { authRouter } from "./routes/authRoutes.js"
import { userRouter } from "./routes/userRoutes.js"


const app=express();
const PORT= process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    credentials: true, // Allow cookies and credentials
  }));



//api endpoints
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.get("/",(req,res)=>{
    res.send("working")
})
app.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`)
})

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
      req.user = users.find(user => user.id === req.session.userId);
      next();
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
  

 