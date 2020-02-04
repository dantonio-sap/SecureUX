sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("com.sap.secureux.ui.controller.App", {
		onInit: function(){
			this.getUserContext();
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
		}
		
	});
});
