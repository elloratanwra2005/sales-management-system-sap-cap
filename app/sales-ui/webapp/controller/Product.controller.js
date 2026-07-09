sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.Product", {

       onInit: function () {

    this.getOwnerComponent()
        .getRouter()
        .getRoute("products")
        .attachPatternMatched(this.loadProducts, this);

},
loadProducts: function () {

    this.byId("productTable")
        .getBinding("items")
        .refresh();

},

        onBack: function () {

            this.getOwnerComponent().getRouter().navTo("dashboard");

        },

       onEdit: function (oEvent) {

    this._selectedContext =
        oEvent.getSource()
              .getParent()
              .getBindingContext();

    var oProduct = this._selectedContext.getObject();

    this.byId("editName").setValue(oProduct.productName);
    this.byId("editCategory").setValue(oProduct.category);
    this.byId("editPrice").setValue(oProduct.price);
    this.byId("editStock").setValue(oProduct.stock);

    this.byId("editDialog").open();

},
onAddProduct: function () {

    this.getOwnerComponent()
        .getRouter()
        .navTo("addProduct");

},

onDelete: async function (oEvent) {

    var oContext = oEvent
        .getSource()
        .getParent()
        .getBindingContext();

    sap.m.MessageBox.confirm(
        "Delete this product?",
        {
            onClose: async function (sAction) {

                if (sAction !== sap.m.MessageBox.Action.OK) {
                    return;
                }

                try {

                    console.log("Deleting...");

                    await oContext.delete();

                    console.log("Delete completed");

                    sap.m.MessageToast.show("Product Deleted Successfully");

                } catch (oError) {

                    console.error("DELETE ERROR");
                    console.error(oError);

                    sap.m.MessageToast.show("Delete Failed");

                }

            }
        }
    );

},

onSaveEdit: async function () {

    this._selectedContext.setProperty(
        "productName",
        this.byId("editName").getValue()
    );

    this._selectedContext.setProperty(
        "category",
        this.byId("editCategory").getValue()
    );

    this._selectedContext.setProperty(
        "price",
        parseFloat(this.byId("editPrice").getValue())
    );

    this._selectedContext.setProperty(
        "stock",
        parseInt(this.byId("editStock").getValue())
    );

    try {

        await this.getOwnerComponent()
            .getModel()
            .submitBatch("$auto");

        sap.m.MessageToast.show("Product Updated");

        this.byId("editDialog").close();

    } catch (oError) {

    console.error("ERROR:", oError);

    sap.m.MessageToast.show("Update Failed");

}

},

onCancelEdit: function () {

    this.byId("editDialog").close();

},

onSearch: function (oEvent) {

    var sValue = oEvent.getParameter("newValue");

    var oBinding = this.byId("customerTable").getBinding("items");

    var aFilters = [];

    if (sValue) {

        aFilters.push(
            new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("productID", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("productName", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("price", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
        );

    }

    oBinding.filter(aFilters);

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

        MessageToast.show("Product Added Successfully");

        this.getOwnerComponent()
            .getRouter()
            .navTo("products");

    } catch (oError) {

        console.error(oError);

        MessageToast.show("Failed to Add Product");

    }

}
         

    });

});