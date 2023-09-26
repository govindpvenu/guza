const sharp = require("sharp");
module.exports = {
    resizeImages : async (req, res, next) => {
    console.log(req.files)
    if (!req.files) return next();
    console.log("Resizing images ==========>>>>");
    req.body.images = [];
    await Promise.all(
        req.files.map(async file => {
        const newFilename = "r_" + file.filename;
        console.log("Resizing image ----- " + newFilename);
        await sharp(file.path)
            .resize(440, 440)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(`./public/images/${newFilename}`);

        req.body.images.push(newFilename);
        })
    );
    console.log("Passing images to next middleware");
    next();
    }
}