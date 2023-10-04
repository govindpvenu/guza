//GET
//@route /admin/
const dashboard = (req, res) => {
    res.render("admin/dashboard", { layout: "layouts/adminLayout" })
}

//GET
//@route /admin/sales-report
const salesReport = (req, res) => {
    res.render("admin/sales-report", { layout: "layouts/adminLayout" })
}

module.exports = {
    dashboard,
    salesReport
}

