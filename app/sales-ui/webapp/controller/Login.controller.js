sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.Login", {

        onLogin: async function () {

            var sEmployeeID = this.byId("employeeID").getValue();
            var sPassword = this.byId("password").getValue();

            if (!sEmployeeID || !sPassword) {
                MessageToast.show("Please enter Employee ID and Password");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();

            try {

                var aContexts = await oModel
                    .bindList("/Employees")
                    .requestContexts();

                var oEmployee = null;

                aContexts.forEach(function (oContext) {

                    var oData = oContext.getObject();

                    if (
                        oData.employeeID === sEmployeeID &&
                        oData.password === sPassword
                    ) {
                        oEmployee = oData;
                    }

                });

                if (!oEmployee) {

                    MessageToast.show("Invalid Employee ID or Password");
                    return;

                }

                // Create User Model
                var oUserModel = new JSONModel({

                    employeeID: oEmployee.employeeID,
                    employeeName: oEmployee.name

                });

                this.getOwnerComponent().setModel(oUserModel, "user");

                MessageToast.show("Login Successful");

                console.log("Before navigation");

var oRouter = this.getOwnerComponent().getRouter();
console.log(oRouter);

oRouter.navTo("dashboard");

console.log("After navigation");

            } catch (oError) {

                console.error(oError);

                MessageToast.show("Login Failed");

            }

        }

    });

});