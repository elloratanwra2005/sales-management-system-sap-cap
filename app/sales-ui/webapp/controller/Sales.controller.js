sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.Sales", {

        onInit: function () {

    this._allSales = [];

    var oJSONModel = new JSONModel({
        sales: []
    });

    this.getView().setModel(oJSONModel, "sales");

    this.loadSales();

    this.getOwnerComponent()
        .getRouter()
        .getRoute("sales")
        .attachPatternMatched(this.loadSales, this);

},
loadSales: function () {

    var oModel = this.getOwnerComponent().getModel();

    var oJSON = this.getView().getModel("sales");

    oModel.bindList("/Sales", null, null, null, {
        $expand: "employee,product,customer"
    })
    .requestContexts()
    .then(function (aContexts) {

        this._allSales = aContexts.map(function (oContext) {

            var oSale = oContext.getObject();

            return {

                context: oContext,

                saleID: oSale.saleID,

                employeeName: oSale.employee ? oSale.employee.name : "",

                customerName: oSale.customer ? oSale.customer.customerName : "",

                productName: oSale.product ? oSale.product.productName : "",

                quantity: oSale.quantity,

                totalAmount: oSale.totalAmount,

                saleDate: oSale.saleDate

            };

        });

        oJSON.setProperty("/sales", this._allSales);

    }.bind(this));

},

onSearch: function (oEvent) {

    var sValue = oEvent.getParameter("newValue");

    var oBinding = this.byId("customerTable").getBinding("items");

    var aFilters = [];

    if (sValue) {

        aFilters.push(
            new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("customerName", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("phone", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("address", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
        );

    }

    oBinding.filter(aFilters);

},

onDelete: function (oEvent) {

    var oSale = oEvent.getSource()
        .getBindingContext("sales")
        .getObject();

    var oContext = oSale.context;

    MessageBox.confirm(
        "Delete this sale?",
        {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],

            onClose: async function (sAction) {

                if (sAction === MessageBox.Action.YES) {

                    try {

                        await oContext.delete();

                        MessageToast.show("Sale Deleted");

                        this.loadSales();

                    } catch (oError) {

                        console.error(oError);

                        MessageToast.show("Delete Failed");

                    }

                }

            }.bind(this)

        }
    );

},
onBack: function () {

    this.getOwnerComponent()
        .getRouter()
        .navTo("dashboard");

},

onRefresh: function () {

    this.loadSales();

},

onAddSale: function () {

    this.getOwnerComponent()
        .getRouter()
        .navTo("addSale");

},
        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue").toLowerCase();

            var aFiltered = this._allSales.filter(function (oSale) {

                return (
                    oSale.saleID.toLowerCase().includes(sValue) ||
                    oSale.employeeName.toLowerCase().includes(sValue) ||
                    oSale.productName.toLowerCase().includes(sValue)
                );

            });

            this.getView()
                .getModel("sales")
                .setProperty("/sales", aFiltered);

        }

    });

});