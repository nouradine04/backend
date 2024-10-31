const { string, boolean } = require('joi')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true,'Email est obligatoire'],
        trim: true,
        unique:[true,'Email est unique'],
        minLength:[5,'Email doit avoir minimum 5 caracteres'],
        lowercase:true

    },
    nom:{
        type:String,
        required:[true,'Le nom est obligatoire'],
        minLength:[2,'Le nom doit avoir au minimum 2 caracteres ']
    },
    password:{
        type:String,
        required:[true,'le Mot de passe est obligatoire'],
        trim:true,
        select:false
    },
    verified:{
        type:Boolean,
        default:false
    },

    VerificationCodeValidation:{
        type:Number,
        select:false

    },
    MotDePasseOublie:{
        type:String,
        select:false
    },
    MotDePasseOublieCodeValidation:{
        type: Number,
        select:false
    }

},{
    timestamps:true,
}
);
const User = mongoose.model('User', userSchema);

module.exports = User;
