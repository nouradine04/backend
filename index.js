require('dotenv').config();
const express = require('express');
const helmet = require('helmet')
const cors= require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = express.Router();

const app = express()
const authRouter= require('./routers/authRouter')
const bodyParser = require('body-parser');


//app.use(express.json())
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));


app.use(helmet())
app.use(cookieParser())
app.use(express.urlencoded({extended : true }))
app.use(express.json()); // Pour parser le JSON
app.use(cors({
    origin: 'http://localhost:3000', // L'URL de ton frontend
    credentials: true,
}));




mongoose.connect(process.env.MONGO_URI).then(()=>{
  //  console.log("base de donnees connectee")
}).catch((err)=> {
    console.log(err)
})
app.use('/api/auth',authRouter)

app.get('/',(req,res)=>{
    res.json({message:"Hello from the backend"})
})


app.listen(process.env.PORT,()=>{
    console.log("Listening ")
})
// app.use((err, req, res, next) => {
//     if (err instanceof PayloadTooLargeError) {
//         return res.status(413).send('Payload Too Large');
//     }
//     next(err);
// });
