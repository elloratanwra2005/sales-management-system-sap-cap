sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend("salesmanagement.salesui.controller.Dashboard", {

        onInit: function () {

            var oDashboardModel = new JSONModel({
                employeeName: "",
                employeeID: "",
                employees: 0,
                products: 0,
                customers: 0,
                sales: 0,
                revenue: 0,
                revenueIndicator: "None",
                avgSaleValue: 0,
                lowStock: 0,
                period: "month",
                todayDateLabel: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                salesOverview: [],
                salesByCategory: [],
                topProducts: [],
                recentSales: [],
                salesOverviewProps: {
                    plotArea: { dataLabel: { visible: false } },
                    title: { visible: false },
                    legend: { visible: false }
                }
            });

            this.getView().setModel(oDashboardModel, "dashboard");

            var oUser = this.getOwnerComponent().getModel("user");

            if (oUser) {
                oDashboardModel.setProperty("/employeeName", oUser.getProperty("/employeeName"));
                oDashboardModel.setProperty("/employeeID", oUser.getProperty("/employeeID"));
            }

            this.getOwnerComponent()
                .getRouter()
                .getRoute("dashboard")
                .attachPatternMatched(this.loadDashboard, this);

            // Auto-refresh every 60s so charts/KPIs behave like a live dashboard
            this._iRefreshInterval = setInterval(this.loadDashboard.bind(this), 60000);
        },

        onExit: function () {
            if (this._iRefreshInterval) {
                clearInterval(this._iRefreshInterval);
            }
        },

        loadDashboard: function () {

    var oModel = this.getOwnerComponent().getModel();
    var oDashboard = this.getView().getModel("dashboard");
    var sPeriod = oDashboard.getProperty("/period") || "month";

    var pEmployees = oModel.bindList("/Employees").requestContexts();
    var pCustomers = oModel.bindList("/Customers").requestContexts();
    var pProducts = oModel.bindList("/Products").requestContexts();

    Promise.all([pEmployees, pCustomers, pProducts])
        .then(function (aResults) {

            var aEmployees = aResults[0].map(function (c) { return c.getObject(); });
            var aCustomers = aResults[1].map(function (c) { return c.getObject(); });
            var aProducts  = aResults[2].map(function (c) { return c.getObject(); });

            oDashboard.setProperty("/employees", aEmployees.length);
            oDashboard.setProperty("/customers", aCustomers.length);
            oDashboard.setProperty("/products", aProducts.length);
            oDashboard.setProperty("/lowStock", aProducts.filter(function (p) { return p.stock < 10; }).length);

            // Build lookup maps — adjust key fields (ID/employeeId/etc.) to match your entity's actual key
            this._oProductMap = {};
            aProducts.forEach(function (p) { this._oProductMap[p.productId || p.ID] = p; }.bind(this));

            this._oCustomerMap = {};
            aCustomers.forEach(function (c) { this._oCustomerMap[c.customerId || c.ID] = c; }.bind(this));

            this._oEmployeeMap = {};
            aEmployees.forEach(function (e) { this._oEmployeeMap[e.employeeId || e.ID] = e; }.bind(this));

            // Only now fetch Sales, since the joins depend on the maps above
            return oModel.bindList("/Sales", null, null, null, {
    $orderby: "saleDate desc",
    $expand: "product,customer,employee"
}).requestContexts();

        }.bind(this))
        .then(function (aContexts) {

            var aSales = aContexts.map(function (oCtx) { return oCtx.getObject(); });

            var oNow = new Date();
            var oCutoff = new Date(oNow);
            if (sPeriod === "week") {
                oCutoff.setDate(oNow.getDate() - 7);
            } else {
                oCutoff.setMonth(oNow.getMonth() - 1);
            }
            var aFiltered = aSales.filter(function (s) { return new Date(s.saleDate) >= oCutoff; });

            this._processSalesOverview(aFiltered, oDashboard);
            this._processSalesByCategory(aFiltered, oDashboard);
            this._processTopProducts(aFiltered, oDashboard);
            this._processRecentSales(aSales.slice(0, 8), oDashboard);
            this._processKpis(aFiltered, oDashboard);

        }.bind(this))
        .catch(function (oError) {
            MessageToast.show("Could not load dashboard data");
            // eslint-disable-next-line no-console
            console.error(oError);
        });
},

        _onLoadError: function (sEntity, oError) {
            MessageToast.show("Could not load " + sEntity + " data");
        },

        _processSalesOverview: function (aSales, oDashboard) {

            var oByDate = {};

            aSales.forEach(function (oSale) {
                var sDate = new Date(oSale.saleDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                oByDate[sDate] = (oByDate[sDate] || 0) + Number(oSale.totalAmount || 0);
            });

            var aChart = Object.keys(oByDate).map(function (sDate) {
                return { date: sDate, revenue: oByDate[sDate] };
            });

            oDashboard.setProperty("/salesOverview", aChart);
        },

       _processSalesByCategory: function (aSales, oDashboard) {

    var oByCategory = {};
    var fTotal = 0;

    aSales.forEach(function (oSale) {
        var sCategory = (oSale.product && oSale.product.category) || "Other";
        var fAmount = Number(oSale.totalAmount || 0);
        oByCategory[sCategory] = (oByCategory[sCategory] || 0) + fAmount;
        fTotal += fAmount;
    });

    var aCategoryData = Object.keys(oByCategory).map(function (sCategory) {
        var fAmount = oByCategory[sCategory];
        return {
            category: sCategory,
            amount: fAmount,
            percent: fTotal ? Math.round((fAmount / fTotal) * 100) : 0
        };
    });

    oDashboard.setProperty("/salesByCategory", aCategoryData);
},

_processTopProducts: function (aSales, oDashboard) {

    var oByProduct = {};

    aSales.forEach(function (oSale) {
        var sName = (oSale.product && oSale.product.productName) || "Unknown";

        if (!oByProduct[sName]) {
            oByProduct[sName] = { name: sName, revenue: 0, qty: 0 };
        }
        oByProduct[sName].revenue += Number(oSale.totalAmount || 0);
        oByProduct[sName].qty += Number(oSale.quantity || 0);
    });

    var aTop = Object.keys(oByProduct)
        .map(function (k) { return oByProduct[k]; })
        .sort(function (a, b) { return b.revenue - a.revenue; })
        .slice(0, 5);

    var fMaxRevenue = aTop.length ? aTop[0].revenue : 0;
    aTop.forEach(function (p) {
        p.sharePct = fMaxRevenue ? Math.round((p.revenue / fMaxRevenue) * 100) : 0;
    });

    oDashboard.setProperty("/topProducts", aTop);
},

_processRecentSales: function (aSales, oDashboard) {

    var aRecent = aSales.map(function (oSale) {
        return {
            saleId: oSale.saleID || oSale.ID,
            product: (oSale.product && oSale.product.productName) || "—",
            customer: (oSale.customer && oSale.customer.customerName) || "—",
            employee: (oSale.employee && oSale.employee.name) || "—",
            quantity: oSale.quantity,
            totalAmount: oSale.totalAmount,
            date: new Date(oSale.saleDate).toLocaleDateString("en-IN")
        };
    });

    oDashboard.setProperty("/recentSales", aRecent);
},

       

        _processKpis: function (aSales, oDashboard) {

            var fRevenue = aSales.reduce(function (sum, s) { return sum + Number(s.totalAmount || 0); }, 0);
            var iCount = aSales.length;

            oDashboard.setProperty("/sales", iCount);
            oDashboard.setProperty("/revenue", fRevenue.toFixed(2));
            oDashboard.setProperty("/avgSaleValue", iCount ? (fRevenue / iCount).toFixed(2) : "0.00");

            // Simple today-vs-yesterday indicator for the revenue tile
            var oToday = new Date().toDateString();
            var oYesterday = new Date(Date.now() - 86400000).toDateString();

            var fToday = 0, fYesterday = 0;
            aSales.forEach(function (s) {
                var sDay = new Date(s.saleDate).toDateString();
                if (sDay === oToday) { fToday += Number(s.totalAmount || 0); }
                if (sDay === oYesterday) { fYesterday += Number(s.totalAmount || 0); }
            });

            oDashboard.setProperty("/revenueIndicator", fToday >= fYesterday ? "Up" : "Down");
        },

        onPeriodChange: function () {
            this.loadDashboard();
        },

        // ---- Navigation ----
        onDashboard: function () {
            // already here — no-op, kept for the sidebar's active item
        },

        onCustomers: function () {
            this.getOwnerComponent().getRouter().navTo("customers");
        },

        onEmployees: function () {
            this.getOwnerComponent().getRouter().navTo("employees");
        },

        onProducts: function () {
            this.getOwnerComponent().getRouter().navTo("products");
        },

        onSales: function () {
            this.getOwnerComponent().getRouter().navTo("sales");
        },

        onReports: function () {
            this.getOwnerComponent().getRouter().navTo("reports");
        },

        onLowStock: function () {
            this.getOwnerComponent().getRouter().navTo("products", { query: { lowStock: true } });
        },

        onAddProduct: function () {
            this.getOwnerComponent().getRouter().navTo("addProduct");
        },

        onAddSale: function () {
            this.getOwnerComponent().getRouter().navTo("addSale");
        },

        onAddCustomer: function () {
            this.getOwnerComponent().getRouter().navTo("addCustomer");
        },

        onAddEmployee: function () {
            this.getOwnerComponent().getRouter().navTo("addEmployee");
        },

        onProductPress: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext("dashboard").getObject();
            this.getOwnerComponent().getRouter().navTo("products", { query: { name: oData.name } });
        },

        onSalePress: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext("dashboard").getObject();
            this.getOwnerComponent().getRouter().navTo("sales", { query: { saleId: oData.saleId } });
        },

        onDateRangePress: function () {
            MessageToast.show("Custom date range picker coming soon");
        },

        onNotifications: function () {
            MessageToast.show("No new notifications");
        },

        onRefresh: function () {
            this.loadDashboard();
            MessageToast.show("Dashboard refreshed");
        },

        onLogout: function () {
            MessageBox.confirm(
                "Are you sure you want to logout?",
                {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            this.getOwnerComponent().getRouter().navTo("login");
                        }
                    }.bind(this)
                }
            );
        }

    });

});