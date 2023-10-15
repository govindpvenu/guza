const asyncHandler = require("express-async-handler")
const Banner = require("../../models/Banner")

//GET
//@route /admin/banner
const banner = asyncHandler(async (req, res) => {
    const allbanner = await Banner.find({ is_Deleted: false })
    const messages = await req.consumeFlash("info")
    res.render("admin/banner", {
        layout: "layouts/adminLayout",
        title: "Banner Management",
        messages,
        allbanner,
    })
})
//GET
//@route /admin/banner/add-banner
const addBanner = asyncHandler(async (req, res) => {
    const messages = await req.consumeFlash("info")
    res.render("admin/add-Banner", {
        layout: "layouts/adminLayout",
        title: "Banner Management",
        messages,
    })
})

//POST
//@route /admin/banner/add-banner
const postBanner = async (req, res) => {
    const { name,status } = req.body
    const image = req.file.filename
    try {
        const banner = await Banner.create({
            name,
            status,
            image,
        })
        await req.flash("info", "Banner added")
        res.redirect("/admin/banner")
    } catch (err) {
    
        if (err.code === 11000) {
            await req.flash("info", "Banner Already Exists")
            res.redirect("/admin/banner/add-Banner")
        }
        console.log(err);
    }
}

//GET
//@route /admin/banner/edit/:id
const editBanner = asyncHandler(async (req, res) => {
    let Banner_id = req.params.id
    let banner = await Banner.findOne({ _id: Banner_id })
    res.render("admin/edit-Banner", {
        layout: "layouts/adminLayout",
        title: "Banner Management",
        banner,
    })
})

//POST
//@route /admin/banner/edit/:id
const updateBanner = asyncHandler(async (req, res) => {
    let Banner_id = req.params.id
    const { name, status } = req.body
    if (req.file) {
        const image = req.file.filename
        await Banner.findOneAndUpdate({ _id: Banner_id }, { image })
    }
    const banner = await Banner.findOneAndUpdate({ _id: Banner_id }, { name, status })
    await req.flash("info", "Banner edited")
    res.redirect("/admin/banner")
})

//GET
//@route /admin/banner/delete/:id
const deleteBanner = asyncHandler(async (req, res) => {
    let Banner_id = req.params.id
    await Banner.findByIdAndUpdate({ _id: Banner_id }, { is_Deleted: true })
    await req.flash("info", "Banner deleted")
    res.redirect("/admin/banner")
})

module.exports = {
    banner,
    addBanner,
    postBanner,
    editBanner,
    updateBanner,
    deleteBanner,
}
