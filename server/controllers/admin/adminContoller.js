//GET
//@route /admin/
const dashboard = (req, res) => {
    res.render("admin/index", { layout: "layouts/adminLayout" })
}

module.exports = {
    dashboard,
}
