function OnSignerStartup(info){}

function ApproveListing(){
    // Approve listings if request made from IPC
    if (req.metadata.scheme == "ipc"){ return "Approve"}
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

function ApproveTx(r) {
    // Approve transactions
	var value = r.transaction.value;
    var fromAddress = r.transaction.from;
    var toAddress = r.transaction.to;
	//Some rules could be applied to what is authorized
    //For now we approve anything
    return "Approve"
}