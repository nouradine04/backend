const { required } = require('joi');
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de l\'hôtel est obligatoire'],
        trim: true,
    },
    adresse: {
        type: String,
        required: [true, 'L\'adresse est obligatoire'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'L\'e-mail est obligatoire'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Veuillez entrer un e-mail valide'],
    },
    telephone: {
        type: String,
        required: [true, 'Le numéro de téléphone est obligatoire'],
        match: [/^\+?[0-9]{1,3}(?: ?[0-9]{2,3}){4}$/, 'Veuillez entrer un numéro de téléphone valide'], 
    },
    
    prixParNuit: {
        type: Number,
        required: [true, 'Le prix par nuit est obligatoire'],
        min: [0, 'Le prix ne peut pas être négatif'],
    },
    
    devise: {
        type: String,
        required: [true, 'La devise est obligatoire'],
        enum: ['XOF', 'EUR', 'USD', 'GBP'], 
    },
    photo: {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true,
        }
    }
}, {
    timestamps: true, 
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
