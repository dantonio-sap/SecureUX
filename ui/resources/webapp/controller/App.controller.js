sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("com.sap.secureux.ui.controller.App", {
		onInit: function(){
			this.getUserContext();
			
			this.oTable = this.byId("idCustomersTable");
			this.oTable.attachEventOnce("updateFinished", function(oEvent){
				this.oReadOnlyTemplate = this.byId("idCustomersTable").removeItem(0);
				this.rebindTable(this.oReadOnlyTemplate, "Navigation");
				this.oEditableTemplate = new sap.m.ColumnListItem({
					cells: [
						new sap.m.HBox({ items: [
							new sap.m.Input({
								value: "{Name}"
							}), new sap.m.Input({
								value: "{ID}"
							}) ]
						}), new sap.m.Input({
							value: "{Region}"
						}), new sap.m.Text({
							text: "{CreatedAt}"
						})
					]
				});
			}, this);
		},
		
		getUserContext: function(){
			var oController = this;
			var urlUserContext = "/userContext.xsjs";
			var oModelUserContext = new JSONModel(urlUserContext);
			
			// This code attached to the data request and parses the response.  This example handles
			// error scenarios (where the service is down, where the server returns 403/access denied, 
			// and finally it parses the scopes in the success authentication response to see if the 
			// user has a specific scope.
			oModelUserContext
				.attachRequestFailed(function(oEvent) {
					var errorObject = oEvent.getParameters();
					oController._parseResponse(errorObject);
				})
				.attachRequestCompleted(function(oEvent) {
					var dataResponse = oEvent.getSource();
					var errorObject = oEvent.getParameter("errorobject");
					oController._parseResponse(errorObject, dataResponse);
				});
			
			// Set the resulting sessionContext to a user JSON model and bind to the view.
			this.getView().setModel(oModelUserContext, "user");
		},
		
		_parseResponse: function(oError, oData){
			if (oError){
				// If Access Denied is returned by the server, redirect the user to the access denied
				// page.
				if (oError.statusCode === 403){
					this.getOwnerComponent().getRouter().navTo("accessdenied");
				}
				else {
					// If any generic error occurs, let the user know with a message.
					jQuery.sap.delayedCall(1000, this, function(){
						MessageBox.error("Unable to connect to server.  Please check with IT helpdesk, or try again later. (" + oError.statusCode + ":" + oError.statusText + ")");
					});
				}
			}
			else{
				// Verify Access - If the user has a "Display" scope then let them have basic access. 
				// If no "Display" scope is found then redirect them to the access denied page.
				var oScopes = oData.getProperty("/scopes");
				if (oScopes.filter(function(row) {
					return (row.endsWith(".Display"));
					}).length === 0) {  
						// No Access
						this.getOwnerComponent().getRouter().navTo("accessdenied");
					}
			}
		},
		
		rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "/Customers",
				template: oTemplate,
				key: "ID"
			}).setKeyboardMode(sKeyboardMode);
		},

		onEdit: function() {
			this.aCustomerCollection = jQuery.extend(true, [], this.getView().getModel().getProperty("/Customers"));
			this.byId("editButton").setVisible(false);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
			this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			// Save Data
			var oView = this.getView();
			var oController = this;
			this.getView().getModel().submitChanges({
				success: function(oEvent){
					// Change table back to read-only
					oView.byId("saveButton").setVisible(false);
					oView.byId("cancelButton").setVisible(false);
					oView.byId("editButton").setVisible(true);
					oController.rebindTable(oController.oReadOnlyTemplate, "Navigation");
				}			
			});
			
			
		},

		onCancel: function() {
			this.byId("cancelButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.getView().getModel().setProperty("/Customers", this.aCustomerCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		}
		
	});
});
