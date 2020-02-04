try{
	// Initialize hana connection/context
	var oConn = $.hdb.getConnection();
	var oSession = $.session;
	
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(oSession.securityContext));
	
	oConn.close();
}
catch(ex){
	// Return error
	$.response.setBody("Failed to retrieve data");
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
}