sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.Employee", {

       onInit: function () {

    this._selectedContext = null;

    this.getOwnerComponent()
        .getRouter()
        .getRoute("employees")
        .attachPatternMatched(this._loadEmployees, this);

},

_loadEmployees: function () {

    this.byId("employeeTable")
        .getBinding("items")
        .refresh();

},

onEdit: function (oEvent) {

    this._selectedContext =
        oEvent.getSource()
            .getParent()
            .getBindingContext();

    var oEmployee =
        this._selectedContext.getObject();

    this.byId("editEmployeeID").setValue(oEmployee.employeeID);
    this.byId("editName").setValue(oEmployee.name);
    this.byId("editPassword").setValue(oEmployee.password);
    this.byId("editDepartment").setValue(oEmployee.department);
    this.byId("editEmail").setValue(oEmployee.email);

    this.byId("editDialog").open();

},

onSaveEdit: async function () {

    this._selectedContext.setProperty(
        "employeeID",
        this.byId("editEmployeeID").getValue()
    );

    this._selectedContext.setProperty(
        "name",
        this.byId("editName").getValue()
    );

    this._selectedContext.setProperty(
        "password",
        this.byId("editPassword").getValue()
    );

    this._selectedContext.setProperty(
        "department",
        this.byId("editDepartment").getValue()
    );

    this._selectedContext.setProperty(
        "email",
        this.byId("editEmail").getValue()
    );

    try {

    await this.getOwnerComponent().getModel().submitBatch("$auto");

    console.log("Batch submitted successfully");

    this.byId("editDialog").close();
    this.byId("employeeTable")
    .getBinding("items")
    .refresh();

    sap.m.MessageToast.show("Employee Updated");

} catch (oError) {

    console.error("Update Error:", oError);

}

},

onDelete: function (oEvent) {

    var oContext = oEvent.getSource()
        .getParent()
        .getBindingContext();

    sap.m.MessageBox.confirm(

        "Are you sure you want to delete this employee?",

        {
            title: "Delete Employee",

            actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO
            ],

            emphasizedAction: sap.m.MessageBox.Action.NO,

            onClose: async function (sAction) {

                if (sAction === sap.m.MessageBox.Action.YES) {

                    try {

                        await oContext.delete();

                        sap.m.MessageToast.show("Employee Deleted");

                    } catch (oError) {

                        console.error(oError);

                        sap.m.MessageToast.show("Delete Failed");

                    }

                }

            }

        }

    );

},

onAddEmployee: function () {

    this.getOwnerComponent()
        .getRouter()
        .navTo("addEmployee");

},

        onBack: function () {

            this.getOwnerComponent().getRouter().navTo("dashboard");

        },

        loadEmployees: function () {

    var oModel = this.getOwnerComponent().getModel();
    var oJSON = this.getView().getModel("employees");

    oModel.bindList("/Employees")
        .requestContexts()
        .then(function (aContexts) {

            this._allEmployees = aContexts.map(function (oContext) {
                return oContext.getObject();
            });

            oJSON.setProperty("/employees", this._allEmployees);

        }.bind(this));

},

onCancelEdit: function () {

    this.byId("editDialog").close();

},

        onSearch: function (oEvent) {

    console.log("Search triggered");

    var sValue = oEvent.getParameter("newValue");

    var oBinding = this.byId("employeeTable").getBinding("items");

    var aFilters = [];

    if (sValue) {

        aFilters.push(
            new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("employeeID", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("department", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
        );

    }

    oBinding.filter(aFilters);

}

    });

});