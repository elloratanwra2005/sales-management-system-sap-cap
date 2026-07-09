sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {

    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.AddCustomer", {

        onBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("customers");

        },

        onSave: async function () {

            var oModel = this.getOwnerComponent().getModel();

            var oCustomer = {

                customerName: this.byId("customerName").getValue(),

                phone: this.byId("phone").getValue(),

                email: this.byId("email").getValue(),

                address: this.byId("address").getValue()

            };

            try {

                await oModel
                    .bindList("/Customers")
                    .create(oCustomer)
                    .created();

                MessageToast.show("Customer Added Successfully");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("customers");

            } catch (oError) {

                console.error(oError);

                MessageToast.show("Failed to Add Customer");

            }

        }

    });

});