//GET
//@route /admin/
const dashboard = (req, res) => {
    res.render("admin/dashboard", { layout: "layouts/adminLayout" })
}

module.exports = {
    dashboard,
}
