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
			this.getView().setModel(oModelUserContext, "user");
		},
		
		_parseResponse: function(oError, oData){
			if (oError){
				if (oError.statusCode === 403){
					this.getOwnerComponent().getRouter().navTo("accessdenied");
				}
				else {
					jQuery.sap.delayedCall(1000, this, function(){
						MessageBox.error("Unable to connect to server.  Please check with IT helpdesk, or try again later. (" + oError.statusCode + ":" + oError.statusText + ")");
					});
				}
			}
			else{
				// Verify Access
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