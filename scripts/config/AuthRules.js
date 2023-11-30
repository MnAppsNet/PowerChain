function OnSignerStartup(info){}

function ApproveListing(req){
    // Approve listings if request made from IPC
    console.log(req.metadata)
    console.log(req.metadata.scheme)
    return "Approve"
}

function ApproveSignData(r){
    // Approve data sign
    if (r.content_type == "application/x-clique-header"){
        for(var i = 0; i < r.messages.length; i++){
         var msg = r.messages[i]
        if (msg.name=="Clique header" && msg.type == "clique"){
            return "Approve"
        }
        }
    }
    return "Reject"
}

function OnApprovedTx(req){
    return "Approve"
}

function ApproveTx(req) {
    // Approve transactions
	//var value = req.transaction.value;
    //var fromAddress = req.transaction.from;
    //var toAddress = req.transaction.to;
	//Some rules could be applied to what is authorized
    //For now we approve anything
    return "Approve"
}