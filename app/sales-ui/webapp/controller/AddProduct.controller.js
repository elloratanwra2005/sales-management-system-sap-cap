sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.AddProduct", {

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSave: async function () {

    var oModel = this.getOwnerComponent().getModel();

    var oData = {

        productID: this.byId("productID").getValue(),
        productName: this.byId("productName").getValue(),
        category: this.byId("category").getValue(),
        price: parseFloat(this.byId("price").getValue()),
        stock: parseInt(this.byId("stock").getValue())

    };

    try {

    await oModel
        .bindList("/Products")
        .create(oData)
        .created();

    MessageToast.show("Product Added");

    this.getOwnerComponent()
        .getModel()
        .refresh();

    this.getOwnerComponent()
        .getRouter()
        .navTo("products");

} catch (oError) {

    console.error(oError);

}

}

    });

});