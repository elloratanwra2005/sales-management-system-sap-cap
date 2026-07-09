sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {

    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.AddEmployee", {

        onBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("employees");

        },

        onSave: async function () {

            var oModel = this.getOwnerComponent().getModel();

            var oEmployee = {

                employeeID: this.byId("employeeID").getValue(),

                name: this.byId("name").getValue(),

                password: this.byId("password").getValue(),

                department: this.byId("department").getValue(),

                email: this.byId("email").getValue()

            };

            try {

                await oModel
                    .bindList("/Employees")
                    .create(oEmployee)
                    .created();

                MessageToast.show("Employee Added Successfully");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("employees");

            } catch (oError) {

                console.error(oError);

                MessageToast.show("Failed to Add Employee");

            }

        }

    });

});