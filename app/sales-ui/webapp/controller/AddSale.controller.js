sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/m/MessageToast"
], function (Controller, Item, MessageToast) {

    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.AddSale", {

        onInit: function () {
            this.loadEmployees();
            this.loadCustomers();
            this.loadProducts();
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        loadEmployees: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oSelect = this.byId("employeeSelect");

            oModel.bindList("/Employees")
                .requestContexts()
                .then(function (aContexts) {

                    aContexts.forEach(function (oContext) {

                        var oEmployee = oContext.getObject();

                        oSelect.addItem(new Item({
                            key: oEmployee.ID,
                            text: oEmployee.name
                        }));

                    });

                });

        },

        loadCustomers: function () {

    var oModel = this.getOwnerComponent().getModel();
    var oSelect = this.byId("customerSelect");

    oModel.bindList("/Customers")
        .requestContexts()
        .then(function (aContexts) {

            aContexts.forEach(function (oContext) {

                var oCustomer = oContext.getObject();

                oSelect.addItem(new Item({
                    key: oCustomer.ID,
                    text: oCustomer.customerName
                }));

            });

        });
        

},
loadProducts: function () {

    

    var oModel = this.getOwnerComponent().getModel();
    var oSelect = this.byId("productSelect");

    this._products = [];

    oModel.bindList("/Products")
        .requestContexts()
        .then(function (aContexts) {

            aContexts.forEach(function (oContext) {

                var oProduct = oContext.getObject();

                console.log(oProduct);

                this._products.push(oProduct);

                oSelect.addItem(new Item({
                    key: oProduct.ID,
                    text: oProduct.productName
                }));

            }.bind(this));

        }.bind(this));

},

onProductChange: function () {

    this.calculateTotal();

},

calculateTotal: function () {

    var sProductID = this.byId("productSelect").getSelectedKey();
    var iQuantity = parseInt(this.byId("quantity").getValue()) || 0;

    var fPrice = 0;

    this._products.forEach(function (oProduct) {

        if (oProduct.ID === sProductID) {
            fPrice = parseFloat(oProduct.price);
        }

    });

    var fTotal = fPrice * iQuantity;

    this.byId("totalAmount").setNumber(fTotal.toFixed(2));

},
onSave: async function () {

    var oModel = this.getOwnerComponent().getModel();

    // Get selected product
    var sProductID = this.byId("productSelect").getSelectedKey();

    // Find selected product
    var oSelectedProduct = this._products.find(function (oProduct) {
        return oProduct.ID === sProductID;
    });

    var iQuantity = parseInt(this.byId("quantity").getValue()) || 0;

    // Stock validation
    if (iQuantity > oSelectedProduct.stock) {
        MessageToast.show("Not enough stock available!");
        return;
    }

    var oSale = {

        saleID: "S" + Math.floor(Math.random() * 100000),

        employee: {
            ID: this.byId("employeeSelect").getSelectedKey()
        },

        customer: {
            ID: this.byId("customerSelect").getSelectedKey()
        },

        product: {
            ID: this.byId("productSelect").getSelectedKey()
        },

        quantity: iQuantity,

        totalAmount: parseFloat(this.byId("totalAmount").getNumber()),

        saleDate: this.byId("saleDate")
            .getDateValue()
            .toISOString()
            .split("T")[0]

    };

    try {

        await oModel
    .bindList("/Sales")
    .create(oSale)
    .created();

// Deduct stock
oSelectedProduct.stock =
    oSelectedProduct.stock - iQuantity;

var oProductContext = await oModel
    .bindList("/Products")
    .requestContexts();

oProductContext.forEach(function (oContext) {

    if (oContext.getObject().ID === oSelectedProduct.ID) {

        oContext.setProperty(
            "stock",
            oSelectedProduct.stock
        );

    }

});

await oModel.submitBatch("$auto");

MessageToast.show("Sale Saved Successfully");

        this.getOwnerComponent()
            .getRouter()
            .navTo("sales");

    } catch (oError) {

        console.error(oError);

        MessageToast.show("Error while saving");

    }

}
    });

});