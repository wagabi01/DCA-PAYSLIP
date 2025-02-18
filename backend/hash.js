const bcrypt = require("bcrypt");
const password = "2025@Elite";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
    console.log(hash);
});