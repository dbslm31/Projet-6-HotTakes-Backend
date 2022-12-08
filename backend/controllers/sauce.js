const Sauce = require('../models/sauce');
const fs = require('fs');



////////////////////////////// Pour créer une nouvelle sauce dans la BD  ////////////////////////////
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    usersLiked: [],
    usersDisliked: []
  });

  sauce.save()
    .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
    .catch(error => { res.status(400).json({ error }) })
};





////////////////////////////// Pour afficher une sauce déjà enregistrée dans la BD  ////////////////////////////
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};



////////////////////////////// Pour modifier une sauce dans la BD  ////////////////////////////
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        if (req.file) {
          fs.unlink(`images/${filename}`, () => {

            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
              .catch(error => res.status(401).json({ error }));
          });
        } else {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(401).json({ error }));
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};



////////////////////////////// Pour supprimer une sauce dans la BD  ////////////////////////////
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
            .catch(error => res.status(401).json({ error }));
        });

      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};



////////////////////////////// Pour afficher les sauces enregistrées dans la BD  ////////////////////////////
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};


////////////////////////////// Pour liker ou disliker une sauce  ////////////////////////////

exports.likeDislikeSauce = (req, res, next) => {


  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {

      //Pour liker une sauce (likes = 1)
      if (req.body.like === 1 && !sauce.usersLiked.includes(req.body.userId) && !sauce.usersDisliked.includes(req.body.userId)) {

        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
          .then(() => res.status(200).json({ message: 'Like ajouté!' }))
          .catch(error => res.status(401).json({ error }));
      }

      //Pour disliker une sauce

      if (req.body.like === -1 && !sauce.usersDisliked.includes(req.body.userId) && !sauce.usersLiked.includes(req.body.userId)) {

        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
          .then(() => res.status(200).json({ message: 'Dislike ajouté!' }))
          .catch(error => res.status(401).json({ error }));
      }

      //Pour annuler un dislike 

      if (req.body.like === 0 && sauce.usersDisliked.includes(req.body.userId)) {

        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
          .then(() => res.status(200).json({ message: 'Dislike retiré!' }))
          .catch(error => res.status(401).json({ error }));
      }

      //Pour annuler un like

      if (req.body.like === 0 && sauce.usersLiked.includes(req.body.userId)) {

        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
          .then(() => res.status(200).json({ message: 'Like retiré!' }))
          .catch(error => res.status(401).json({ error }));
      }




    })
    .catch(error => {
      res.status(400).json({ error });
    });


};










