const { createHmac } = require('crypto');
const { hash, compare, genSalt } = require('bcryptjs');
exports.doHash = async (value) => {
    const saltValue = await genSalt(10); // Générer un salt
    const result = await hash(value, saltValue); // Hacher la valeur avec le salt
    return result; // Retourner le hachage
}

// Fonction pour valider un mot de passe avec un hachage
exports.doHashValidation = async (value, hashedValue) => {
    const result = await compare(value, hashedValue); // Comparer la valeur avec le hachage
    return result; // Retourner le résultat de la comparaison
}

// Fonction pour le HMAC
exports.hmacProcess = (value, key) => {
    const result = createHmac('sha256', key).update(value).digest('hex'); // Créer le HMAC
    return result; // Retourner le HMAC
}