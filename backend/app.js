const express = require('express');
const mongoose = require('mongoose');
//Permet d'extraire objet JSON des requêtes POST
const bodyParser = require('body-parser')

//Permet de travailler avec les chemins de fichiers
const path = require('path');

//Pour stocker les informations sensibles dans un fichier .env
const dotenv = require('dotenv').config()

const app = express();
app.use(express.json());


//Importation du modèle Sauce
const Sauce = require('./models/sauce');

//importation des routers
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauce');

//Connexion à MongoDB
mongoose.connect(`mongodb+srv://${process.env.MDB_USERNAME}:${process.env.MDB_PASSWORD}@hottakesdb.9mgl0wa.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



//Pour éviter les erreurs CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json())


//création route vers api pour authentification des users
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;

