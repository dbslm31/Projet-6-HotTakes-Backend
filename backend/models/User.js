const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Création du schéma user
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Package pour vérifier que l'adresse mail est unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);  