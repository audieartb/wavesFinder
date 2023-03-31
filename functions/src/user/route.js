const router = require("express").Router();
const controller = require("./controller");

router.get("/search/", controller.searchArtist);
router.get("/related/", controller.getMoreLikeThis);
router.get("/favorites", controller.getFavorites);
module.exports = router;
