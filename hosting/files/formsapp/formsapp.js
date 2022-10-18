function addArrayElement(name) {
    //Add a blank item at the end of the list
    //Oddly if we delete it - we will add a delete to send to the server
    //Which works because a delete on the setver is a $set then $pull
    //We either add and emptyp string or dummy object based on the type

    // Initialise here for scope
    let elementBsonType = null;

    if (vueApp.selectedDocTypeSchema[name] == undefined || vueApp.selectedDocTypeSchema[name] == null) {
        const [arrayname, subfield] = name.split('_');
        const schemaElement = vueApp.selectedDocTypeSchema[arrayname][name];

        elementBsonType = getBsonType(schemaElement);
        if (elementBsonType == "array") {

            vueApp.currentDoc.doc[arrayname][name].push('')
        }
        else {
            vueApp.currentDoc.doc[arrayname][name].push({ __xyxxy__: 1 })
        }
    }
    else {
        const elementBsonType = getBsonType(vueApp.selectedDocTypeSchema[name][0])
        //If empty add the one we already are showing first
        if (vueApp.currentDoc.doc[name] == undefined) {
            vueApp.currentDoc.doc[name] = [];
            if (elementBsonType == "document") {
                vueApp.currentDoc.doc[name].push({ __xyxxy__: 1 })
            } else {
                vueApp.currentDoc.doc[name].push('')
            }
        }

        if (elementBsonType == "document") {
            vueApp.currentDoc.doc[name].push({ __xyxxy__: 1 })
        } else {
            vueApp.currentDoc.doc[name].push('')
        }
    }
}