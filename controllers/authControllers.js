const jwt = require('jsonwebtoken');
const { signupSchema,  addHotelSchema , signinSchema } = require("../middlewares/validor");
const User = require('../models/UserModel');
const cloudinary = require('../utils/cloudinary');
require('dotenv').config();
const { doHash, doHashValidation } = require('../utils/hashing'); // Assurez-vous que le chemin est correct
const Hotel = require('../models/HotelModel');
const transport = require('../middlewares/SendMail');
const { createHmac } = require('crypto');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    const { email, nom, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, nom, password });

        if (error) {
            return res.status(401).json({ succes: false, messsage: error.details[0].message });
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ succes: false, messsage: "L'utilisateur existe" });
        }
        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            nom,
            password: hashedPassword,
        });
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            sucess: true, message: "Votre compte a été créé avec succès",
            result,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};


exports.signin = async (req, res) => {
    const { email, password } = req.body;

    // Vérifie que les champs email et password sont bien fournis
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email et mot de passe sont requis." });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        
        // Vérifie si l'utilisateur existe
        if (!user) {
            return res.status(401).json({ success: false, message: "Utilisateur non trouvé" });
        }
        if (!user.password) {
            return res.status(500).json({ success: false, message: "Le mot de passe de l'utilisateur est manquant." });
        }

        // Compare le mot de passe fourni avec le mot de passe haché
        const isMatch = await doHashValidation(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
        }

        // Génère un token JWT
        const token = jwt.sign({ userId: user._id, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            success: true,
            message: "Connexion réussie",
            token,
            nom: user.nom // Inclure le nom dans la réponse
        });
    } catch (error) {
        console.error(error); // Utilise console.error pour les erreurs
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};
exports.addHotel = async (req, res) => {
    try {
        // Validation des données du formulaire d'ajout d'hôtel
        const { error } = addHotelSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Extraction des champs nécessaires
        const { nom, adresse, price, email, telephone, devise, prixParNuit, photo } = req.body;

        // Vérifier si un hôtel existe déjà avec le même email ou nom
        const existingHotel = await Hotel.findOne({ $or: [{ email }, { nom }] });
        if (existingHotel) {
            return res.status(400).json({
                success: false,
                message: "Cet hôtel existe déjà."
            });
        }

        // Upload de l'image sur Cloudinary
        const result = await cloudinary.uploader.upload(photo, {
            folder: "HotelModel",
        });

        // Créer un nouvel hôtel avec les données validées et l'URL de l'image
        const newHotel = new Hotel({
            nom,
            adresse,
            price,
            email,
            telephone,
            devise,
            prixParNuit,
            photo: {
                public_id: result.public_id,  // ID public pour la gestion de l'image
                url: result.secure_url         // URL sécurisée de l'image
            }
        });

        // Sauvegarder l'hôtel dans la base de données
        const savedHotel = await newHotel.save();

        // Réponse en cas de succès
        res.status(201).json({
            success: true,
            message: "Hôtel ajouté avec succès.",
            hotel: savedHotel
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'hôtel:', error); // Log de l'erreur
        res.status(500).json({
            success: false,
            message: "Erreur du serveur."
        });
    }
}

exports.signout = async (req, res) => {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ sucess: true, message: "Déconnexion réussie" });
}

exports.sendermail = async (req, res) => {
    const { email } = req.body;
    try {
        // Rechercher l'utilisateur par email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'Utilisateur inexistant' });
        }

        if (!existingUser.verified) {
            return res.status(400).json({ success: false, message: 'Votre compte doit être vérifié avant de continuer.' });
        }

        // Générer un code de validation aléatoire
        const codeValue = Math.floor(Math.random() * 1000000).toString();

        // Hacher le code avant de le sauvegarder
        const hashedCodeValue = createHmac('sha256', process.env.HMAC_VERIFICATION_CODE_SECRET)
            .update(codeValue)
            .digest('hex');

        // Envoi de l'email avec le code de récupération
        let info = await transport.sendMail({
            from: process.env.NODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Mot de passe oublié",
            html: `<h1>${codeValue}</h1>`
        });

        if (info.accepted[0] === existingUser.email) {
            existingUser.MotDePasseOublie = hashedCodeValue;
            existingUser.MotDePasseOublieCodeValidation = Date.now();
            await existingUser.save();

            return res.status(200).json({ success: true, message: "Code envoyé avec succès" });
        }

        return res.status(500).json({ success: false, message: "Échec de l'envoi du code" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Erreur du serveur" });
    }
};

exports.VerificationMotDePasseOublieCodeValidation = async (req, res) => {
    const { email, providedCode, newPassword } = req.body;

    try {
        // Rechercher l'utilisateur par email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'Utilisateur inexistant' });
        }

        // Hacher le code fourni par l'utilisateur et le comparer à celui sauvegardé
        const hashedProvidedCode = createHmac('sha256', process.env.HMAC_VERIFICATION_CODE_SECRET)
            .update(providedCode)
            .digest('hex');

        if (hashedProvidedCode !== existingUser.MotDePasseOublie) {
            return res.status(400).json({ success: false, message: 'Code de validation incorrect.' });
        }

        // Vérifier si le code est expiré (par exemple, valable pendant 15 minutes)
        const currentTime = Date.now();
        if ((currentTime - existingUser.MotDePasseOublieCodeValidation) > 15 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Le code de validation a expiré.' });
        }

        // Hacher le nouveau mot de passe et le mettre à jour
        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        existingUser.MotDePasseOublie = undefined; // Effacer le code après utilisation
        existingUser.MotDePasseOublieCodeValidation = undefined;
        await existingUser.save();

        res.status(200).json({ success: true, message: 'Mot de passe mis à jour avec succès.' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Erreur du serveur." });
    }
};

exports.listHotel = async (req, res) => {
    try {
        const hotels = await Hotel.find(); // Supposons que vous utilisez Mongoose
        res.status(200).json(hotels);
    } catch (error) {
        console.error("Erreur lors de la récupération des hôtels : ", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des hôtels' });
    }
};

exports.signout = async (req, res) => {
    try {
        res.clearCookie('token'); 
        return res.json({
            success: true,
            message: "Déconnexion réussie"
        });
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la déconnexion"
        });
    }
};
