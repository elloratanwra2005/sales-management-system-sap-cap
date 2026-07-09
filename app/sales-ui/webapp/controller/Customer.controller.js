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

    return Controller.extend("salesmanagement.salesui.controller.Customer", {

        onInit: function () {

            this._allCustomers = [];
            this._selectedContext = null;

            this.getOwnerComponent()
                .getRouter()
                .getRoute("customers")
                .attachPatternMatched(this.loadCustomers, this);

        },

        loadCustomers: function () {

            var oModel = this.getOwnerComponent().getModel();

            oModel.bindList("/Customers")
                .requestContexts()
                .then(function (aContexts) {

                    this._allCustomers = aContexts.map(function (oContext) {
                        return oContext.getObject();
                    });

                    this.byId("customerTable")
                        .getBinding("items")
                        .refresh();

                }.bind(this));

        },

        onRefresh: function () {

            this.byId("customerTable")
                .getBinding("items")
                .refresh();

        },

        onBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("dashboard");

        },

        onAddCustomer: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("addCustomer");

        },

        onEdit: function (oEvent) {

            this._selectedContext =
                oEvent.getSource()
                    .getParent()
                    .getBindingContext();

            var oCustomer = this._selectedContext.getObject();

            this.byId("editCustomerName").setValue(oCustomer.customerName);
            this.byId("editPhone").setValue(oCustomer.phone);
            this.byId("editEmail").setValue(oCustomer.email);
            this.byId("editAddress").setValue(oCustomer.address);

            this.byId("editDialog").open();

        },

        onSaveEdit: async function () {

            this._selectedContext.setProperty(
                "customerName",
                this.byId("editCustomerName").getValue()
            );

            this._selectedContext.setProperty(
                "phone",
                this.byId("editPhone").getValue()
            );

            this._selectedContext.setProperty(
                "email",
                this.byId("editEmail").getValue()
            );

            this._selectedContext.setProperty(
                "address",
                this.byId("editAddress").getValue()
            );

            try {

                await this.getOwnerComponent()
                    .getModel()
                    .submitBatch("$auto");

                this.byId("editDialog").close();

                MessageToast.show("Customer Updated");

            } catch (oError) {

                console.error(oError);

                MessageToast.show("Update Failed");

            }

        },

        onCancelEdit: function () {

            this.byId("editDialog").close();

        },

        onDelete: function (oEvent) {

            var oContext = oEvent.getSource()
                .getParent()
                .getBindingContext();

            MessageBox.confirm(
                "Are you sure you want to delete this customer?",
                {

                    title: "Delete Customer",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    emphasizedAction: MessageBox.Action.NO,

                    onClose: async function (sAction) {

                        if (sAction === MessageBox.Action.YES) {

                            try {

                                await oContext.delete();

                                MessageToast.show("Customer Deleted");

                            } catch (oError) {

                                console.error(oError);

                                MessageToast.show("Delete Failed");

                            }

                        }

                    }

                }
            );

        },

        onSearch: function (oEvent) {

    var sValue = oEvent.getParameter("newValue");

    var oBinding = this.byId("customerTable").getBinding("items");

    if (!sValue) {
        oBinding.filter([]);
        return;
    }

    var aFilters = [

        new Filter("customerName", FilterOperator.Contains, sValue),

        new Filter("phone", FilterOperator.Contains, sValue),

        new Filter("email", FilterOperator.Contains, sValue),

        new Filter("address", FilterOperator.Contains, sValue)

    ];

    oBinding.filter(
        new Filter({
            filters: aFilters,
            and: false
        })
    );

}

    });

});