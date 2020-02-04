sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.sap.secureux.ui.controller.App", {
		onInit: function(){
			this.getUserContext();
		},
		
		getUserContext: function(){
			var urlUserContext = "/userContext.xsjs";
			var oModelUserContext = new JSONModel(urlUserContext);
			this.getView().setModel(oModelUserContext, "user");
		}
		
	});
});