// Correct import dans chaque fichier
const joi = require('joi'); 


exports.signupSchema = joi.object({
    email: joi.string()
            .min(6)
            .max(60)
            .required()
            .email({
                tlds:{allow : ['com','net']},
            }),
    nom: joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Le nom est obligatoire',
            'string.min': 'Le nom doit avoir au moins 3 caractères',
            'string.max': 'Le nom ne doit pas dépasser 30 caractères',
        }),

        password: joi.string()
        .min(8) // Exige un mot de passe d'au moins 8 caractères
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // Mot de passe avec lettres et chiffres
        .messages({
            'string.pattern.base': 'Le mot de passe doit contenir uniquement des lettres et des chiffres',
            'string.empty': 'Le mot de passe est obligatoire',
            'string.min': 'Le mot de passe doit avoir au moins 8 caractères',
        }),
});

exports.signinSchema = joi.object({
        email: joi.string()
            .min(6)
            .max(60)
            .required()
            .email({ tlds: { allow: ['com', 'net'] } }),
        password: joi.string()
            .min(8)
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .messages({
                'string.pattern.base': 'Le mot de passe doit contenir uniquement des lettres et des chiffres',
                'string.empty': 'Le mot de passe est obligatoire',
                'string.min': 'Le mot de passe doit avoir au moins 8 caractères',
            })});
        






exports.addHotelSchema = joi.object({
    nom: joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Le nom de l\'hôtel est obligatoire',
            'string.min': 'Le nom doit avoir au moins 3 caractères',
            'string.max': 'Le nom ne doit pas dépasser 100 caractères',
        }),
    adresse: joi.string()
        .min(5)
        .max(200)
        .required()
        .messages({
            'string.empty': 'L\'adresse est obligatoire',
            'string.min': 'L\'adresse doit avoir au moins 5 caractères',
            'string.max': 'L\'adresse ne doit pas dépasser 200 caractères',
        }),
    email: joi.string()
        .email({ tlds: { allow: ['com', 'net'] } })
        .required()
        .messages({
            'string.empty': 'L\'email est obligatoire',
            'string.email': 'Veuillez fournir un email valide',
        }),
    telephone: joi.string()
        .pattern(/^\+221 \d{2} \d{3} \d{2} \d{2}$/)
        .required()
        .messages({
            'string.empty': 'Le numéro de téléphone est obligatoire',
            'string.pattern.base': 'Le numéro de téléphone doit être au format +221 XX XXX XX XX',
        }),
    prixParNuit: joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'Le prix par nuit doit être un nombre',
            'number.min': 'Le prix par nuit doit être supérieur à 0',
            'any.required': 'Le prix par nuit est obligatoire',
        }),
    devise: joi.string()
        .valid('XOF', 'USD', 'EUR')
        .required()
        .messages({
            'string.empty': 'La devise est obligatoire',
            'any.only': 'La devise doit être XOF, USD ou EUR',
        }),
    photo: joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'La photo doit être une URL valide',
        }),
});
